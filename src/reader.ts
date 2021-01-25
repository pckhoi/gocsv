import SliceReader from './slice_reader'
import { ReaderError, ParseError, ParseErrMessage } from './errors'
import { RuneError, validRune } from './utf8'
import RecordBuffer from './record_buffer'

const isStringArray = (s: any): s is string[] => {
  return s.length === 0 || (s.length > 0 && typeof s[0] === 'string')
}

/**
 * Reader configurations at the time of creation.
 * @typedef {Object} readerConfig
 */
export type readerConfig = {
  /**
   * The field delimiter. Default to comma character (',').
   * Comma must be a valid rune and must not be \r, \n,
   * or the Unicode replacement character (0xFFFD).
   */
  comma?: string
  /**
   * Comment, if defined, is the comment character.
   * Lines beginning with the comment character without preceding whitespace are ignored.
   * With leading whitespace the comment character becomes part of the
   * field, even if {@link trimLeadingSpace} is true.
   * Comment must be a valid rune and must not be \r, \n,
   * or the Unicode replacement character (0xFFFD).
   * It must also not be equal to {@link comma}.
   */
  comment?: string
  /**
   * The number of expected fields per record.
   * If fieldsPerRecord is positive, Read requires each record to
   * have the given number of fields. If fieldsPerRecord is 0, Read sets it to
   * the number of fields in the first record, so that future records must
   * have the same field count. If fieldsPerRecord is negative, no check is
   * made and records may have a variable number of fields.
   */
  fieldsPerRecord?: number
  /**
   * If lazyQuotes is true,
   * a quote may appear in an unquoted field and a
   * non-doubled quote may appear in a quoted field.
   */
  lazyQuotes?: boolean
  /**
   * If trimLeadingSpace is true,
   * leading white space in a field is ignored.
   * This is done even if the field delimiter, Comma, is white space.
   */
  trimLeadingSpace?: boolean
}

/**
 * Called once for each record. If this callback returns `true`
 * then abort reading prematurely.
 * @param {string[]} record - Array of fields in this record.
 * @returns {boolean|void} true to abort iteration.
 */
export type recordCallback = (record: string[]) => boolean | void

export const errInvalidDelim = new ReaderError('invalid field or comment delimiter')

const validDelim = (s: string) => {
  const r = s.charCodeAt(0)
  return r !== 0 && s !== '"' && s !== '\r' && s !== '\n' && validRune(r) && r !== RuneError
}

// lengthNL reports the number of bytes for the trailing \n.
const lengthNL = (b?: string) => {
  if (b && b.length > 0 && b[b.length - 1] === '\n') {
    return 1
  }
  return 0
}

/**
 * @class
 */
export default class Reader {
  private comma = ','
  private comment = ''
  private commaLen = 0
  private lazyQuotes = false
  private trimLeadingSpace = false
  private r: SliceReader
  private numLine = 0
  private line = ''
  private fullLine = ''
  private lastRecord = []
  private parsingQuotedString = false
  private recLine = 0
  private rawBuffer = new Uint8Array()
  private recordBuffer: RecordBuffer

  /**
   * Create a new instance of Reader.
   * @constructor
   * @param input - CSV text string, bytes array or readable stream of those types.
   * @param config - If present then override default settings.
   */
  constructor(
    input: ReadableStream<string> | ReadableStream<Uint8Array> | string | Uint8Array,
    config?: readerConfig
  ) {
    this.r = new SliceReader(input)
    this._setComma(',')
    let fieldsPerRecord = 0
    if (config) {
      if (config.comma && config.comma.length > 1) {
        throw new Error('invalid config: comma can be one character only')
      }
      if (config.comment && config.comment.length > 1) {
        throw new Error('invalid config: comment can be one character only')
      }
      if (config.comma) {
        this._setComma(config.comma)
      }
      if (config.comment) {
        this._setComment(config.comment)
      }
      fieldsPerRecord = config.fieldsPerRecord || fieldsPerRecord
      this.lazyQuotes = config.lazyQuotes || this.lazyQuotes
      this.trimLeadingSpace = config.trimLeadingSpace || this.trimLeadingSpace
    }
    this.recordBuffer = new RecordBuffer(fieldsPerRecord)
  }

  /**
   * @ignore
   */
  private _setComma(cstr: string): void {
    this.comma = cstr
    this.commaLen = cstr.length
  }

  /**
   * @ignore
   */
  private _setComment(cstr: string): void {
    this.comment = cstr
  }

  private _readLine(): string | null {
    const sl = this.r.readSlice('\n')
    if (sl === null) return sl
    let line = sl as string

    if (line.length > 0 && this.r.eof) {
      // For backwards compatibility, drop trailing \r before EOF.
      if (line[line.length - 1] === '\r') {
        line = line.slice(0, line.length - 1)
      }
    }
    this.numLine++
    // Normalize \r\n to \n on all input lines.
    const n = line.length
    if (n >= 2 && line[n - 2] === '\r' && line[n - 1] === '\n') {
      line = line.slice(0, n - 2) + '\n'
    }
    return line
  }

  private _validateCommaComment(): void {
    if (
      this.comma === this.comment ||
      !validDelim(this.comma) ||
      (this.comment !== '' && !validDelim(this.comment))
    ) {
      throw errInvalidDelim
    }
  }

  private _handleEOF(): void {
    // Abrupt end of file (EOF or error).
    if (!this.lazyQuotes) {
      const col = this.fullLine.length
      throw new ParseError({
        startLine: this.recLine,
        line: this.numLine,
        column: col,
        err: ParseErrMessage.ErrQuote,
      })
    }
    this.recordBuffer.demarcateField()
    this.parsingQuotedString = false
  }

  private _processLine(): boolean {
    if (this.trimLeadingSpace) {
      this.line = this.line.trimStart()
    }
    if (this.line.length === 0 || this.line[0] !== '"') {
      // Non-quoted string field
      const i = this.line.indexOf(this.comma)
      let field = this.line
      if (i >= 0) {
        field = field.slice(0, i)
      } else {
        field = field.slice(0, field.length - lengthNL(field))
      }
      // Check to make sure a quote does not appear in field.
      if (!this.lazyQuotes) {
        const j = field.indexOf('"')
        if (j >= 0) {
          const col = this.fullLine.length - (this.line.length - j)
          throw new ParseError({
            startLine: this.recLine,
            line: this.numLine,
            column: col,
            err: ParseErrMessage.ErrBareQuote,
          })
        }
      }
      this.recordBuffer.append(field)
      this.recordBuffer.demarcateField()
      if (i >= 0) {
        this.line = this.line.slice(i + this.commaLen)
        return false
      }
      return true
    } else {
      // Quoted string field
      this.parsingQuotedString = true
      this.line = this.line.slice(1)
    }
    return false
  }

  private _parseQuotedString(): boolean | string[] {
    const i = this.line.indexOf('"')
    if (i >= 0) {
      // Hit next quote.
      this.recordBuffer.append(this.line.slice(0, i))
      this.line = this.line.slice(i + 1)
      const rn = this.line[0]

      if (rn === '"') {
        // `""` sequence (append quote).
        this.recordBuffer.append('"')
        this.line = this.line.slice(1)
      } else if (rn === this.comma) {
        // `",` sequence (end of field).
        this.line = this.line.slice(this.commaLen)
        this.recordBuffer.demarcateField()
        this.parsingQuotedString = false
        return false
      } else if (lengthNL(this.line) === this.line.length) {
        // `"\n` sequence (end of line).
        this.recordBuffer.demarcateField()
        this.parsingQuotedString = false
        return true
      } else if (this.lazyQuotes) {
        // `"` sequence (bare quote).
        this.recordBuffer.append('"')
      } else {
        // `"*` sequence (invalid non-escaped quote).
        const col = this.fullLine.length - this.line.length - 1
        throw new ParseError({
          startLine: this.recLine,
          line: this.numLine,
          column: col,
          err: ParseErrMessage.ErrQuote,
        })
      }
    } else if (this.line.length > 0) {
      // Hit end of line (copy all data so far).
      this.recordBuffer.append(this.line)
      const sl = this._readLine()
      if (sl === null) {
        if (this.r.eof) {
          this._handleEOF()
          return true
        }
        return []
      }
      this.line = sl
      this.fullLine = this.line
    } else {
      this._handleEOF()
      return true
    }
    return false
  }

  private _readLineSkipEmpty(): boolean {
    // Read line (automatically skipping past empty lines and any comments).
    if (this.parsingQuotedString) {
      const sl = this._readLine()
      if (sl === null) {
        return true
      }
      this.line = sl
      this.fullLine = this.line
    } else {
      this.line = ''
      this.fullLine = ''
      while (true) {
        const sl = this._readLine()
        if (sl === null) return true
        this.line = sl
        if (this.comment !== '' && this.line[0] === this.comment) {
          this.line = ''
          continue // Skip comment lines
        }
        if (this.line.length > 0 && this.line.length === lengthNL(this.line)) {
          this.line = ''
          continue // Skip empty lines
        }
        this.fullLine = this.line
        break
      }
      if (this.fullLine.length === 0) {
        return true
      }
    }
    return false
  }

  private _fillRecordBuffer(): boolean {
    while (true) {
      if (this.parsingQuotedString) {
        const sl = this._parseQuotedString()
        if (isStringArray(sl)) return true
        if (sl) break
      } else {
        if (this._processLine()) break
      }
    }
    return false
  }

  private _readRecord(): string[] {
    this._validateCommaComment()
    if (this._readLineSkipEmpty()) return []

    // Parse each field in the record.
    if (!this.parsingQuotedString) {
      this.recordBuffer.reset()
      this.recLine = this.numLine // Starting line for record
    }
    if (this._fillRecordBuffer()) return []

    return this.recordBuffer.toStringArray(this.recLine)
  }

  /**
   * Read all the remaining records.
   * @param {recordCallback} cb - The callback that will be called with each record.
   * @returns {Promise} Resolve when there's no record left or if reading is aborted.
   */
  async readAll(cb: recordCallback): Promise<void> {
    do {
      await this.r.fill()
      while (true) {
        const record = this._readRecord()
        if (record.length === 0) {
          break
        }
        if (cb(record)) return
      }
    } while (!this.r.eof)
  }

  /**
   * Read at most N records.
   * @param {int} n - Maximum number of records to read.
   * @param {recordCallback} cb - The callback to be called with each record.
   * @returns {Promise} Resolve when there's no record left or the maximum number of records have been reached.
   */
  async readN(n: number, cb: recordCallback): Promise<void> {
    let i = n
    while (true) {
      while (true) {
        const record = this._readRecord()
        if (record.length === 0) {
          break
        }
        if (cb(record)) return
        if (--i <= 0) return
      }
      if (this.r.eof) {
        break
      }
      await this.r.fill()
    }
  }
}
