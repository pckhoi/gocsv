import { ParseErrMessage, ParseError } from './errors'

export default class RecordBuffer {
  writeIdx = 0
  fieldsPerRecord: number
  fieldBuffer: string[] = []
  fields: string[] = []

  constructor(fieldsPerRecord = 0) {
    this.fieldsPerRecord = fieldsPerRecord
  }

  append(s: string): void {
    this.fieldBuffer.push(s)
  }

  reset(): void {
    if (this.fieldsPerRecord > 0) {
      this.fields = Array(this.fieldsPerRecord)
    } else {
      this.fields = []
    }
    this.fieldBuffer = []
    this.writeIdx = 0
  }

  demarcateField(): void {
    const s = this.fieldBuffer.length === 1 ? this.fieldBuffer[0] : this.fieldBuffer.join('')
    if (this.fieldsPerRecord > 0) {
      this.fields[this.writeIdx] = s
    } else {
      this.fields.push(s)
    }
    this.writeIdx++
    this.fieldBuffer = []
  }

  toStringArray(recLine: number): string[] {
    // Check or update the expected fields per record.
    if (this.fieldsPerRecord > 0) {
      if (this.writeIdx !== this.fieldsPerRecord) {
        throw new ParseError({
          startLine: recLine,
          line: recLine,
          err: ParseErrMessage.ErrFieldCount,
        })
      }
    } else if (this.fieldsPerRecord === 0) {
      this.fieldsPerRecord = this.writeIdx
    }
    return this.fields
  }
}
