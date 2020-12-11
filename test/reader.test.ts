import { ParseErrMessage, ParseError } from '../src/errors'
import Reader, { errInvalidDelim } from '../src/reader'
import { RuneError } from '../src/utf8'
import { stringStream } from '../src/io'

type testcase = {
  name: string
  input?: string
  output?: string[][]
  error?: Error

  // These fields are copied into the Reader
  comma?: string
  comment?: string
  useFieldsPerRecord?: boolean // false (default) means FieldsPerRecord is -1
  fieldsPerRecord?: number
  lazyQuotes?: boolean
  trimLeadingSpace?: boolean
}

describe('Reader', () => {
  const tests: testcase[] = [
    {
      name: 'Simple',
      input: 'a,b,c\n',
      output: [['a', 'b', 'c']]
    },
    {
      name: 'CRLF',
      input: 'a,b\r\nc,d\r\n',
      output: [
        ['a', 'b'],
        ['c', 'd']
      ]
    },
    {
      name: 'BareCR',
      input: 'a,b\rc,d\r\n',
      output: [['a', 'b\rc', 'd']]
    },
    {
      name: 'RFC4180test',
      input: `#field1,field2,field3
"aaa","bb
b","ccc"
"a,a","b""bb","ccc"
zzz,yyy,xxx
`,
      output: [
        ['#field1', 'field2', 'field3'],
        ['aaa', 'bb\nb', 'ccc'],
        ['a,a', `b"bb`, 'ccc'],
        ['zzz', 'yyy', 'xxx']
      ],
      useFieldsPerRecord: true,
      fieldsPerRecord: 0
    },
    {
      name: 'NoEOLTest',
      input: 'a,b,c',
      output: [['a', 'b', 'c']]
    },
    {
      name: 'Semicolon',
      input: 'a;b;c\n',
      output: [['a', 'b', 'c']],
      comma: ';'
    },
    {
      name: 'MultiLine',
      input: `"two
line","one line","three
line
field"`,
      output: [['two\nline', 'one line', 'three\nline\nfield']]
    },
    {
      name: 'BlankLine',
      input: 'a,b,c\n\nd,e,f\n\n',
      output: [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]
    },
    {
      name: 'BlankLineFieldCount',
      input: 'a,b,c\n\nd,e,f\n\n',
      output: [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ],
      useFieldsPerRecord: true,
      fieldsPerRecord: 0
    },
    {
      name: 'TrimSpace',
      input: ' a,  b,   c\n',
      output: [['a', 'b', 'c']],
      trimLeadingSpace: true
    },
    {
      name: 'LeadingSpace',
      input: ' a,  b,   c\n',
      output: [[' a', '  b', '   c']]
    },
    {
      name: 'Comment',
      input: '#1,2,3\na,b,c\n#comment',
      output: [['a', 'b', 'c']],
      comment: '#'
    },
    {
      name: 'NoComment',
      input: '#1,2,3\na,b,c',
      output: [
        ['#1', '2', '3'],
        ['a', 'b', 'c']
      ]
    },
    {
      name: 'LazyQuotes',
      input: `a "word","1"2",a","b`,
      output: [[`a "word"`, `1"2`, `a"`, `b`]],
      lazyQuotes: true
    },
    {
      name: 'BareQuotes',
      input: `a "word","1"2",a"`,
      output: [[`a "word"`, `1"2`, `a"`]],
      lazyQuotes: true
    },
    {
      name: 'BareDoubleQuotes',
      input: `a""b,c`,
      output: [[`a""b`, `c`]],
      lazyQuotes: true
    },
    {
      name: 'BadDoubleQuotes',
      input: `a""b,c`,
      error: new ParseError({ startLine: 1, line: 1, column: 1, err: ParseErrMessage.ErrBareQuote })
    },
    {
      name: 'TrimQuote',
      input: ` "a"," b",c`,
      output: [['a', ' b', 'c']],
      trimLeadingSpace: true
    },
    {
      name: 'BadBareQuote',
      input: `a "word","b"`,
      error: new ParseError({ startLine: 1, line: 1, column: 2, err: ParseErrMessage.ErrBareQuote })
    },
    {
      name: 'BadTrailingQuote',
      input: `"a word",b"`,
      error: new ParseError({
        startLine: 1,
        line: 1,
        column: 10,
        err: ParseErrMessage.ErrBareQuote
      })
    },
    {
      name: 'ExtraneousQuote',
      input: `"a "word","b"`,
      error: new ParseError({ startLine: 1, line: 1, column: 3, err: ParseErrMessage.ErrQuote })
    },
    {
      name: 'BadFieldCount',
      input: 'a,b,c\nd,e',
      error: new ParseError({ startLine: 2, line: 2, err: ParseErrMessage.ErrFieldCount }),
      useFieldsPerRecord: true,
      fieldsPerRecord: 0
    },
    {
      name: 'BadFieldCount1',
      input: `a,b,c`,
      error: new ParseError({ startLine: 1, line: 1, err: ParseErrMessage.ErrFieldCount }),
      useFieldsPerRecord: true,
      fieldsPerRecord: 2
    },
    {
      name: 'FieldCount',
      input: 'a,b,c\nd,e',
      output: [
        ['a', 'b', 'c'],
        ['d', 'e']
      ]
    },
    {
      name: 'TrailingCommaEOF',
      input: 'a,b,c,',
      output: [['a', 'b', 'c', '']]
    },
    {
      name: 'TrailingCommaEOL',
      input: 'a,b,c,\n',
      output: [['a', 'b', 'c', '']]
    },
    {
      name: 'TrailingCommaSpaceEOF',
      input: 'a,b,c, ',
      output: [['a', 'b', 'c', '']],
      trimLeadingSpace: true
    },
    {
      name: 'TrailingCommaSpaceEOL',
      input: 'a,b,c, \n',
      output: [['a', 'b', 'c', '']],
      trimLeadingSpace: true
    },
    {
      name: 'TrailingCommaLine3',
      input: 'a,b,c\nd,e,f\ng,hi,',
      output: [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'hi', '']
      ],
      trimLeadingSpace: true
    },
    {
      name: 'NotTrailingComma3',
      input: 'a,b,c, \n',
      output: [['a', 'b', 'c', ' ']]
    },
    {
      name: 'CommaFieldTest',
      input: `x,y,z,w
x,y,z,
x,y,,
x,,,
,,,
"x","y","z","w"
"x","y","z",""
"x","y","",""
"x","","",""
"","","",""
`,
      output: [
        ['x', 'y', 'z', 'w'],
        ['x', 'y', 'z', ''],
        ['x', 'y', '', ''],
        ['x', '', '', ''],
        ['', '', '', ''],
        ['x', 'y', 'z', 'w'],
        ['x', 'y', 'z', ''],
        ['x', 'y', '', ''],
        ['x', '', '', ''],
        ['', '', '', '']
      ]
    },
    {
      name: 'TrailingCommaIneffective1',
      input: 'a,b,\nc,d,e',
      output: [
        ['a', 'b', ''],
        ['c', 'd', 'e']
      ],
      trimLeadingSpace: true
    },
    {
      name: 'StartLine1', // Issue 19019
      input: 'a,"b\nc"d,e',
      error: new ParseError({ startLine: 1, line: 2, column: 1, err: ParseErrMessage.ErrQuote })
    },
    {
      name: 'StartLine2',
      input: 'a,b\n"d\n\n,e',
      error: new ParseError({ startLine: 2, line: 5, column: 0, err: ParseErrMessage.ErrQuote })
    },
    {
      name: 'CRLFInQuotedField', // Issue 21201
      input: 'A,"Hello\r\nHi",B\r\n',
      output: [['A', 'Hello\nHi', 'B']]
    },
    {
      name: 'BinaryBlobField', // Issue 19410
      input: 'x09\x41\xb4\x1c,aktau',
      output: [['x09A\xb4\x1c', 'aktau']]
    },
    {
      name: 'TrailingCR',
      input: 'field1,field2\r',
      output: [['field1', 'field2']]
    },
    {
      name: 'QuotedTrailingCR',
      input: '"field"\r',
      output: [['field']]
    },
    {
      name: 'QuotedTrailingCRCR',
      input: '"field"\r\r',
      error: new ParseError({ startLine: 1, line: 1, column: 6, err: ParseErrMessage.ErrQuote })
    },
    {
      name: 'FieldCR',
      input: 'field\rfield\r',
      output: [['field\rfield']]
    },
    {
      name: 'FieldCRCR',
      input: 'field\r\rfield\r\r',
      output: [['field\r\rfield\r']]
    },
    {
      name: 'FieldCRCRLF',
      input: 'field\r\r\nfield\r\r\n',
      output: [['field\r'], ['field\r']]
    },
    {
      name: 'FieldCRCRLFCR',
      input: 'field\r\r\n\rfield\r\r\n\r',
      output: [['field\r'], ['\rfield\r']]
    },
    {
      name: 'FieldCRCRLFCRCR',
      input: 'field\r\r\n\r\rfield\r\r\n\r\r',
      output: [['field\r'], ['\r\rfield\r'], ['\r']]
    },
    {
      name: 'MultiFieldCRCRLFCRCR',
      input: 'field1,field2\r\r\n\r\rfield1,field2\r\r\n\r\r,',
      output: [
        ['field1', 'field2\r'],
        ['\r\rfield1', 'field2\r'],
        ['\r\r', '']
      ]
    },
    {
      name: 'NonASCIICommaAndComment',
      input: 'a£b,c£ \td,e\n€ comment\n',
      output: [['a', 'b,c', 'd,e']],
      trimLeadingSpace: true,
      comma: '£',
      comment: '€'
    },
    {
      name: 'NonASCIICommaAndCommentWithQuotes',
      input: 'a€"  b,"€ c\nλ comment\n',
      output: [['a', '  b,', ' c']],
      comma: '€',
      comment: 'λ'
    },
    {
      // λ and θ start with the same byte.
      // This tests that the parser doesn't confuse such characters.
      name: 'NonASCIICommaConfusion',
      input: '"abθcd"λefθgh',
      output: [['abθcd', 'efθgh']],
      comma: 'λ',
      comment: '€'
    },
    {
      name: 'NonASCIICommentConfusion',
      input: 'λ\nλ\nθ\nλ\n',
      output: [['λ'], ['λ'], ['λ']],
      comment: 'θ'
    },
    {
      name: 'QuotedFieldMultipleLF',
      input: '"\n\n\n\n"',
      output: [['\n\n\n\n']]
    },
    {
      name: 'MultipleCRLF',
      input: '\r\n\r\n\r\n\r\n'
    },
    {
      // The implementation may read each line in several chunks if it doesn't fit entirely
      // in the read buffer, so we should test the code to handle that condition.
      name: 'HugeLines',
      input: '#ignore\n'.repeat(10000) + '@'.repeat(5000) + ',' + '*'.repeat(5000),
      output: [['@'.repeat(5000), '*'.repeat(5000)]],
      comment: '#'
    },
    {
      name: 'QuoteWithTrailingCRLF',
      input: '"foo"bar"\r\n',
      error: new ParseError({ startLine: 1, line: 1, column: 4, err: ParseErrMessage.ErrQuote })
    },
    {
      name: 'LazyQuoteWithTrailingCRLF',
      input: '"foo"bar"\r\n',
      output: [[`foo"bar`]],
      lazyQuotes: true
    },
    {
      name: 'DoubleQuoteWithTrailingCRLF',
      input: '"foo""bar"\r\n',
      output: [[`foo"bar`]]
    },
    {
      name: 'EvenQuotes',
      input: `""""""""`,
      output: [[`"""`]]
    },
    {
      name: 'OddQuotes',
      input: `"""""""`,
      error: new ParseError({ startLine: 1, line: 1, column: 7, err: ParseErrMessage.ErrQuote })
    },
    {
      name: 'LazyOddQuotes',
      input: `"""""""`,
      output: [[`"""`]],
      lazyQuotes: true
    },
    {
      name: 'BadComma1',
      comma: '\n',
      error: errInvalidDelim
    },
    {
      name: 'BadComma2',
      comma: '\r',
      error: errInvalidDelim
    },
    {
      name: 'BadComma3',
      comma: '"',
      error: errInvalidDelim
    },
    {
      name: 'BadComma4',
      comma: String.fromCharCode(RuneError),
      error: errInvalidDelim
    },
    {
      name: 'BadComment1',
      comment: '\n',
      error: errInvalidDelim
    },
    {
      name: 'BadComment2',
      comment: '\r',
      error: errInvalidDelim
    },
    {
      name: 'BadComment3',
      comment: String.fromCharCode(RuneError),
      error: errInvalidDelim
    },
    {
      name: 'BadCommaComment',
      comma: 'X',
      comment: 'X',
      error: errInvalidDelim
    }
  ]

  for (let tt of tests) {
    it(`should handle ${tt.name}`, async () => {
      const r = new Reader(stringStream(tt.input))

      if (tt.comma) {
        r.setComma(tt.comma)
      }
      if (tt.comment) {
        r.setComment(tt.comment)
      }
      if (tt.useFieldsPerRecord) {
        r.fieldsPerRecord = tt.fieldsPerRecord || 0
      } else {
        r.fieldsPerRecord = -1
      }
      r.lazyQuotes = tt.lazyQuotes || false
      r.trimLeadingSpace = tt.trimLeadingSpace || false

      try {
        const out = await r.readAll()
        if (!tt.output) {
          expect(out).toHaveLength(0)
        } else {
          expect(out).toEqual(tt.output)
        }
      } catch (e) {
        expect(e).toEqual(tt.error)
      }
    })
  }
})
