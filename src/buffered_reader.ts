import { byte, bytes } from './byte'

const minReadBufferSize = 16
const maxConsecutiveEmptyReads = 100

class BufferedReaderError extends Error {
  constructor(msg: string) {
    super(`BufferedReader: ${msg}`)
  }
}

// BufferedReader mirror functionalities of go's bufio.Reader
export default class BufferedReader {
  buf = new Uint8Array()
  rd: ReadableStream // reader provided by the client
  r = 0 // buf read position
  w = 0 // buf write position
  line = new Uint8Array()
  unreadData?: Uint8Array
  lastByte?: number // last byte read for UnreadByte; -1 means invalid
  lastRuneSize?: number // size of last rune read for UnreadRune; -1 means invalid
  eof: boolean

  constructor(rd: ReadableStream, size = 4096) {
    this.eof = false
    if (size < minReadBufferSize) {
      size = minReadBufferSize
    }
    this.rd = rd
    this.reset(new Uint8Array(size), rd)
  }

  reset(buf: Uint8Array, r: ReadableStream): void {
    this.buf = buf
    this.rd = r
    this.lastByte = -1
    this.lastRuneSize = -1
  }

  buffered(): number {
    return this.w - this.r
  }

  async fill(): Promise<void> {
    // Slide existing data to beginning.
    if (this.r > 0) {
      this.buf.copyWithin(0, this.r, this.w)
      this.buf.fill(0, this.w - this.r)
      this.w -= this.r
      this.r = 0
    }

    if (this.w >= this.buf.length) {
      throw new BufferedReaderError('tried to fill full buffer')
    }

    const reader = this.rd?.getReader()
    if (!reader) {
      throw new BufferedReaderError("stream's reader is undefined")
    }

    // Read new data: try a limited number of times.
    for (let i = maxConsecutiveEmptyReads; i > 0; i--) {
      let bArr: Uint8Array
      if (this.unreadData) {
        bArr = this.unreadData
        this.unreadData = undefined
      } else {
        const { done, value } = await reader.read()
        if (done) {
          reader.releaseLock()
          throw new Error('EOF')
        }
        if (typeof value === 'string') {
          bArr = bytes(value)
        } else if (value instanceof Uint8Array) {
          bArr = value
        } else {
          throw new BufferedReaderError(`unhandled value type "${typeof value}"`)
        }
      }

      const n = bArr.length
      if (this.w + n >= this.buf.length) {
        this.buf.set(bArr.slice(0, this.buf.length - this.w), this.w)
        this.unreadData = bArr.slice(this.buf.length - this.w)
        this.w = this.buf.length
        reader.releaseLock()
        return
      }

      this.buf.set(bArr, this.w)
      this.w += n
      if (n > 0) {
        reader.releaseLock()
        return
      }
    }
    throw new BufferedReaderError('no progress')
  }

  async readSlice(delim: number): Promise<Uint8Array> {
    let s = 0 // search start index
    while (true) {
      // Search buffer.
      let i = this.buf.slice(this.r + s, this.w).indexOf(delim)
      if (i >= 0) {
        i += s
        this.line = this.buf.slice(this.r, this.r + i + 1)
        this.r += i + 1
        break
      }

      // Buffer full?
      if (this.buffered() >= this.buf.length) {
        this.r = this.w
        this.line = this.buf
        throw new BufferedReaderError('buffer is full')
      }

      s = this.w - this.r // do not rescan area we scanned before

      try {
        await this.fill() // buffer is not full
      } catch (e) {
        this.line = this.buf.slice(this.r, this.w)
        this.r = this.w
        if (e.message === 'EOF') {
          this.eof = true
          break
        }
        throw e
      }
    }

    // Handle last byte, if any.
    const i = this.line.length - 1
    if (i >= 0) {
      this.lastByte = this.line[i]
      this.lastRuneSize = -1
    }

    return this.line
  }

  sliceStream(delim: number | string): ReadableStream {
    let num: number
    if (typeof delim === 'string') {
      num = byte(delim)
    } else {
      num = delim
    }
    return new ReadableStream({
      pull: controller => {
        this.readSlice(num).then(
          buf => {
            if (buf.length === 0) {
              controller.close()
            }
            controller.enqueue(buf)
          },
          err => {
            throw err
          }
        )
      }
    })
  }
}
