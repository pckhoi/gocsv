import { bytesSlice } from './byte'
import { ParseErrMessage, ParseError } from './errors'

export default class RecordBuffer {
  array = new Uint8Array(4096)
  writeIdx = 0
  fieldIndexes: number[] = []
  fieldsPerRecord: number

  constructor(fieldsPerRecord = 0) {
    this.fieldsPerRecord = fieldsPerRecord
  }

  private _growArray(len: number): void {
    const oldLen = this.array.length
    if (oldLen >= len) return
    let newLen = oldLen
    while (newLen < len) {
      newLen *= 2
    }
    const newBuffer = new Uint8Array(newLen)
    newBuffer.set(this.array)
    this.array = newBuffer
  }

  append(sl: Uint8Array): void {
    const n = sl.length
    this._growArray(this.writeIdx + n)
    this.array.set(sl, this.writeIdx)
    this.writeIdx += n
  }

  reset(): void {
    this.writeIdx = 0
    this.fieldIndexes = []
  }

  demarcateField(): void {
    this.fieldIndexes.push(this.writeIdx)
  }

  toStringArray(recLine: number, dst?: string[]): string[] {
    if (!dst) {
      dst = []
    }
    if (dst.length > this.fieldIndexes.length) {
      dst = dst.slice(0, this.fieldIndexes.length)
    }
    let preIdx = 0
    const decoder = new TextDecoder()
    for (let i = 0; i < this.fieldIndexes.length; i++) {
      const idx = this.fieldIndexes[i]
      dst[i] = decoder.decode(bytesSlice(this.array, preIdx, idx))
      preIdx = idx
    }

    // Check or update the expected fields per record.
    if (this.fieldsPerRecord > 0) {
      if (dst.length !== this.fieldsPerRecord) {
        throw new ParseError({
          startLine: recLine,
          line: recLine,
          err: ParseErrMessage.ErrFieldCount,
        })
      }
    } else if (this.fieldsPerRecord === 0) {
      this.fieldsPerRecord = dst.length
    }
    return dst
  }
}
