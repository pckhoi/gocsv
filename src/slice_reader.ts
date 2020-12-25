import { bytes } from './byte'
import { LineReaderError } from './errors'

const maxConsecutiveEmptyReads = 100

const isReadableStream = (s: any): s is ReadableStream => {
  return typeof s.getReader === 'function'
}

export default class SliceReader {
  buf = new ArrayBuffer(0)
  rd?: ReadableStream // reader provided by the client
  r = 0 // buf read position
  eof = false

  constructor(source: ReadableStream | string | Uint8Array) {
    if (isReadableStream(source)) {
      this.rd = source
    } else if (typeof source === 'string') {
      this.buf = new TextEncoder().encode(source).buffer
      this.eof = true
    } else {
      this.buf = source.buffer
      this.eof = true
    }
  }

  async fill(): Promise<void> {
    if (!this.rd) return

    const existingLen = this.buf.byteLength - this.r

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
      const newBytesArray = new Uint8Array(n + existingLen)
      newBytesArray.set(new Uint8Array(this.buf, this.r))
      newBytesArray.set(bArr, existingLen)
      this.buf = newBytesArray.buffer
      this.r = 0
      if (n > 0) {
        reader.releaseLock()
        return
      }
    }
    throw new LineReaderError('no progress')
  }

  readSlice(delim: number): Uint8Array | null {
    // Search buffer.
    const view = new Uint8Array(this.buf, this.r)
    const n = view.length
    if (n === 0) {
      return null
    }
    const i = view.indexOf(delim)
    if (i >= 0) {
      this.r += i + 1
      return view.slice(0, i + 1)
    } else if (this.eof) {
      this.r += view.length
      return view
    }
    return null
  }
}
