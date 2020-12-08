import BufferedReader from './buffered_reader'
import { appendBytesArray, byte, bytes, decodeBytes, indexRune, trimLeftFunc } from './byte'
import { isSpace } from './unicode'

type ReaderConfig = {
  comma?: string
  comment?: string
  fieldsPerRecord?: number
  lazyQuotes?: boolean
  trimLeadingSpace?: boolean
}

const validDelim = (r: string) => {
  const encoder = new TextEncoder()
  let b = new Uint8Array()
  try {
    const b = encoder.encode(r)
  } catch (e) {
    return false
  }
  return b.length !== 0 && r != '"' && r != '\r' && r != '\n'
}

// lengthNL reports the number of bytes for the trailing \n.
const lengthNL = (b?: Uint8Array) => {
  if (b && b.length > 0 && b[b.length - 1] === byte('\n')) {
    return 1
  }
  return 0
}

// nextRune returns the next rune in b or utf8.RuneError.
const nextRune = (b?: Uint8Array) => {
  if (!b) return ''
  return decodeBytes(b)[0]
}

export default class Reader {
  comma: string
  comment = ''
  fieldsPerRecord = 0
  lazyQuotes = false
  trimLeadingSpace = false
  r: BufferedReader
  numLine = 0
  fieldIndexes = []
  lastRecord = []
  rawBuffer = new Uint8Array()
  recordBuffer = new Uint8Array()

  constructor(inputStream: ReadableStream, config?: ReaderConfig) {
    this.r = new BufferedReader(inputStream)
    this.comma = ','
    if (config) {
      this.comma = config.comma || this.comma
      this.comment = config.comment || this.comment
      this.fieldsPerRecord = config.fieldsPerRecord || this.fieldsPerRecord
      this.lazyQuotes = config.lazyQuotes || this.lazyQuotes
      this.trimLeadingSpace = config.trimLeadingSpace || this.trimLeadingSpace
    }
  }

  async readLine(): Promise<Uint8Array> {
    const nl = byte('\n')
    const cr = byte('\r')
    let line
    try {
      line = await this.r.readSlice(nl)
    } catch (e) {
      if (e.message.indexOf('buffer is full') !== -1) {
        this.rawBuffer = Uint8Array.from(this.r.line)
        while (true) {
          try {
            await this.r.readSlice(nl)
          } catch (e) {
            if (e.message.indexOf('buffer is full') === -1) {
              throw e
            }
            this.rawBuffer = appendBytesArray(this.rawBuffer, this.r.line)
          }
          break
        }
        line = this.rawBuffer
      } else {
        throw e
      }
    }
    // TODO: drop trailing \r before EOF
    // if len(line) > 0 && err == io.EOF {
    //   err = nil
    //   // For backwards compatibility, drop trailing \r before EOF.
    //   if (line[line.length-1] === '\r') {
    //     line = line[:len(line)-1]
    //   }
    // }
    this.numLine++
    // Normalize \r\n to \n on all input lines.
    const n = line.length
    if (n >= 2 && line[n - 2] === cr && line[n - 1] === nl) {
      line[n - 2] = nl
      line = line.slice(0, n - 1)
    }
    return line
  }

  // parseQuotedField() {
	// 		// Quoted string field
	// 		line = line[quoteLen:]
	// 		for {
	// 			i := bytes.IndexByte(line, '"')
	// 			if i >= 0 {
	// 				// Hit next quote.
	// 				this.recordBuffer = append(this.recordBuffer, line[:i]...)
	// 				line = line[i+quoteLen:]
	// 				switch rn := nextRune(line); {
	// 				case rn == '"':
	// 					// `""` sequence (append quote).
	// 					this.recordBuffer = append(this.recordBuffer, '"')
	// 					line = line[quoteLen:]
	// 				case rn == this.Comma:
	// 					// `",` sequence (end of field).
	// 					line = line[commaLen:]
	// 					this.fieldIndexes = append(this.fieldIndexes, len(this.recordBuffer))
	// 					continue parseField
	// 				case lengthNL(line) == len(line):
	// 					// `"\n` sequence (end of line).
	// 					this.fieldIndexes = append(this.fieldIndexes, len(this.recordBuffer))
	// 					break
	// 				case this.LazyQuotes:
	// 					// `"` sequence (bare quote).
	// 					this.recordBuffer = append(this.recordBuffer, '"')
	// 				default:
	// 					// `"*` sequence (invalid non-escaped quote).
	// 					col := utf8.RuneCount(fullLine[:len(fullLine)-len(line)-quoteLen])
	// 					err = &ParseError{StartLine: recLine, Line: this.numLine, Column: col, Err: ErrQuote}
	// 					break
	// 				}
	// 			} else if len(line) > 0 {
	// 				// Hit end of line (copy all data so far).
	// 				this.recordBuffer = append(this.recordBuffer, line...)
	// 				if errRead != nil {
	// 					break
	// 				}
	// 				line, errRead = this.readLine()
	// 				if errRead == io.EOF {
	// 					errRead = nil
	// 				}
	// 				fullLine = line
	// 			} else {
	// 				// Abrupt end of file (EOF or error).
	// 				if !this.LazyQuotes && errRead == nil {
	// 					col := utf8.RuneCount(fullLine)
	// 					err = &ParseError{StartLine: recLine, Line: this.numLine, Column: col, Err: ErrQuote}
	// 					break
	// 				}
	// 				this.fieldIndexes = append(this.fieldIndexes, len(this.recordBuffer))
	// 				break
	// 			}
	// 		}
  // }

  async readRecord(dst: string[]): Promise<string[]> {
    if (
      this.comma === this.comment ||
      !validDelim(this.comma) ||
      (this.comment !== '' && !validDelim(this.comment))
    ) {
      throw new Error('csv: invalid field or comment delimiter')
    }

    // Read line (automatically skipping past empty lines and any comments).
    let line = new Uint8Array()
    let fullLine: Uint8Array | undefined
    let errRead: Error | undefined
    while (!errRead) {
      try {
        line = await this.readLine()
      } catch (e) {
        errRead = e
      }
      if (this.comment !== '' && nextRune(line) === this.comment) {
        line = undefined
        continue // Skip comment lines
      }
      if (!errRead && line && line.length === lengthNL(line)) {
        line = undefined
        continue // Skip empty lines
      }
      fullLine = line
      break
    }
    // if (errRead == io.EOF) {
    //   return nil, errRead
    // }



	// Parse each field in the record.
	const quoteLen = 1
	const commaLen = bytes(this.comma).length
	const recLine = this.numLine // Starting line for record
	this.recordBuffer = this.recordBuffer.slice(0, 0)
	this.fieldIndexes = this.fieldIndexes.slice(0, 0)
	while(true) {
		if (this.trimLeadingSpace) {
			line = trimLeftFunc(line, isSpace)
		}
		if (line.length === 0 || line[0] !== byte('"')) {
			// Non-quoted string field
			const i = indexRune(line, this.comma)
			const field = line
			if i >= 0 {
				field = field[:i]
			} else {
				field = field[:field?.length-lengthNL(field)]
			}
			// Check to make sure a quote does not appear in field.
			if !this.LazyQuotes {
				if j := bytes.IndexByte(field, '"'); j >= 0 {
					col := utf8.RuneCount(fullLine[:fullLine?.length-line?.lengthj:])])
					err = &ParseError{StartLine: recLine, Line: this.numLine, Column: col, Err: ErrBareQuote}
					break
				}
			}
			this.recordBuffer = append(this.recordBuffer, field...)
			this.fieldIndexes = append(this.fieldIndexes, this?.lengthrecordBuffer))
			if i >= 0 {
				line = line[i+commaLen:]
				continue
			}
			break
		} else {
		}
	}
	if err == nil {
		err = errRead
	}
  }
}
