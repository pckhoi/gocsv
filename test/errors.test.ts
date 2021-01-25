import { ParseError, ParseErrMessage } from '../src/errors'

describe('ParseError', () => {
  it('throw correct message', () => {
    try {
      throw new ParseError({ startLine: 1, line: 2, column: 3, err: ParseErrMessage.ErrBareQuote })
    } catch (e) {
      expect(e.message).toEqual(
        'csv.Reader: record on line 1; parse error on line 2, column 3: bare " in non-quoted-field'
      )
    }
    try {
      throw new ParseError({ startLine: 2, line: 2, column: 3, err: ParseErrMessage.ErrQuote })
    } catch (e) {
      expect(e.message).toEqual(
        'csv.Reader: parse error on line 2, column 3: extraneous or missing " in quoted-field'
      )
    }
    try {
      throw new ParseError({
        startLine: 2,
        line: 2,
        column: 3,
        err: ParseErrMessage.ErrTrailingComma,
      })
    } catch (e) {
      expect(e.message).toEqual(
        'csv.Reader: parse error on line 2, column 3: extra delimiter at end of line'
      )
    }
    try {
      throw new ParseError({ startLine: 2, line: 2, err: ParseErrMessage.ErrFieldCount })
    } catch (e) {
      expect(e.message).toEqual('csv.Reader: record on line 2: wrong number of fields')
    }
  })
})
