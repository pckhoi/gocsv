import { bytes } from './byte'
import { LineReaderError } from './errors'

const maxConsecutiveEmptyReads = 100

const isReadableStream = (s: any): s is ReadableStream => {
  return typeof s.getReader === 'function'
}

export default class SliceReader {
  buf = new Uint8Array()
  rd?: ReadableStream // reader provided by the client
  r = 0 // buf read position
  eof = false

  constructor(source: ReadableStream | string | Uint8Array) {
    if (isReadableStream(source)) {
      this.rd = source
    } else if (typeof source === 'string') {
      this.buf = bytes(source)
      this.eof = true
    } else {
      this.buf = source
      this.eof = true
    }
  }

  async fill(): Promise<void> {
    if (!this.rd) return

    const existingData = this.buf.slice(this.r)
    this.buf = existingData
    const existingLen = existingData.length
    // Slide existing data to beginning.
    if (this.r > 0) {
      this.r = 0
    }

    const reader = this.rd.getReader()

    // Read new data: try a limited number of times.
    for (let i = maxConsecutiveEmptyReads; i > 0; i--) {
      let bArr: Uint8Array
      const { done, value } = await reader.read()
      if (done) {
        reader.releaseLock()
        this.eof = true
        return
      }
      if (typeof value === 'string') {
        bArr = bytes(value)
      } else if (value instanceof Uint8Array) {
        bArr = value
      } else {
        reader.releaseLock()
        throw new LineReaderError(`unhandled value type "${typeof value}"`)
      }

      const n = bArr.length
      this.buf = new Uint8Array(n + existingLen)
      this.buf.set(existingData)
      this.buf.set(bArr, existingLen)
      if (n > 0) {
        reader.releaseLock()
        return
      }
    }
    throw new LineReaderError('no progress')
  }

  readSlice(delim: number): Uint8Array | null {
    // Search buffer.
    const n = this.buf.length
    if (this.r === n) return null
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
