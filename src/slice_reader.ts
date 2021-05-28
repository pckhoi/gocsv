import { ReaderError } from './errors'

const maxConsecutiveEmptyReads = 100

const isReadableStream = (s: any): s is ReadableStream => {
  return typeof s.getReader === 'function'
}

const decoder = new TextDecoder()

export default class SliceReader {
  buf = ''
  rd?: ReadableStream<string> | ReadableStream<Uint8Array> // reader provided by the client
  r = 0 // buf read position
  eof = false

  constructor(source: ReadableStream<string> | ReadableStream<Uint8Array> | string | Uint8Array) {
    if (isReadableStream(source)) {
      this.rd = source
    } else if (typeof source === 'string') {
      this.buf = source
      this.eof = true
    } else {
      this.buf = decoder.decode(source)
      this.eof = true
    }
  }

  async fill(): Promise<void> {
    if (!this.rd || this.rd.locked) return

    const reader = this.rd.getReader()

    // Read new data: try a limited number of times.
    for (let i = maxConsecutiveEmptyReads; i > 0; i--) {
      let newStr: string
      const { done, value } = await reader.read()
      if (done) {
        reader.releaseLock()
        this.eof = true
        return
      }
      if (typeof value === 'string') {
        newStr = value
      } else if (value instanceof Uint8Array) {
        newStr = decoder.decode(value)
      } else {
        reader.releaseLock()
        throw new ReaderError(`unhandled stream result value type "${typeof value}"`)
      }

      const n = newStr.length
      this.buf = this.buf.slice(this.r) + newStr
      this.r = 0
      if (n > 0) {
        reader.releaseLock()
        return
      }
    }
    throw new ReaderError('no progress')
  }

  readSlice(delim: string): string | null {
    // Search buffer.
    const n = this.buf.length
    if (n === this.r) {
      return null
    }
    const i = this.buf.slice(this.r).indexOf(delim)
    if (i >= 0) {
      const line = this.buf.slice(this.r, this.r + i + 1)
      this.r += i + 1
      return line
    } else if (this.eof) {
      const line = this.buf.slice(this.r)
      this.r = n
      return line
    }
    return null
  }
}
