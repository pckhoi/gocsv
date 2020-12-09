import {
  equal,
  trimLeftFunc,
  trimFunc,
  trimRightFunc,
  indexFunc,
  lastIndexFunc,
  indexRune
} from '../src/byte'
import * as unicode from '../src/unicode'
import { RuneError, MaxRune } from '../src/utf8'
import { bytes } from './test_utils'

const compareTests: [Uint8Array, Uint8Array, number][] = [
  [bytes(''), bytes(''), 0],
  [bytes('a'), bytes(''), 1],
  [bytes(''), bytes('a'), -1],
  [bytes('abc'), bytes('abc'), 0],
  [bytes('abd'), bytes('abc'), 1],
  [bytes('abc'), bytes('abd'), -1],
  [bytes('ab'), bytes('abc'), -1],
  [bytes('abc'), bytes('ab'), 1],
  [bytes('x'), bytes('ab'), 1],
  [bytes('ab'), bytes('x'), -1],
  [bytes('x'), bytes('a'), 1],
  [bytes('b'), bytes('x'), -1],
  // test runtime·memeq's chunked implementation
  [bytes('abcdefgh'), bytes('abcdefgh'), 0],
  [bytes('abcdefghi'), bytes('abcdefghi'), 0],
  [bytes('abcdefghi'), bytes('abcdefghj'), -1],
  [bytes('abcdefghj'), bytes('abcdefghi'), 1],
  // nil tests
  [new Uint8Array(), new Uint8Array(), 0],
  [bytes(''), new Uint8Array(), 0],
  [new Uint8Array(), bytes(''), 0],
  [bytes('a'), new Uint8Array(), 1],
  [new Uint8Array(), bytes('a'), -1]
]

type predicate = {
  f: (key: number) => boolean
  name: string
}

const isSpace: predicate = { f: unicode.isSpace, name: 'IsSpace' }
const isDigit: predicate = { f: unicode.isDigit, name: 'IsDigit' }
const isUpper: predicate = { f: unicode.isUpper, name: 'IsUpper' }
const isValidRune: predicate = {
  f: (r: number): boolean => r != RuneError,
  name: 'IsValidRune'
}

const not = (p: predicate): predicate => ({
  f: (r: number) => !p.f(r),
  name: 'not ' + p.name
})

const space = '\t\v\r\f\n\u0085\u00a0\u2000\u3000'

describe('byte package', () => {
  describe('equal', () => {
    it('should work', () => {
      for (let tt of compareTests) {
        const eql = equal(tt[0], tt[1])
        expect(eql).toEqual(tt[2] === 0)
      }
    })
  })

  describe('trimLeftFunc', () => {
    const trimFuncTests = [
      {
        f: isSpace,
        in: new TextEncoder().encode(space + ' hello ' + space),
        trimOut: new TextEncoder().encode('hello'),
        leftOut: new TextEncoder().encode('hello ' + space),
        rightOut: new TextEncoder().encode(space + ' hello')
      },
      {
        f: isDigit,
        in: new TextEncoder().encode('\u0e50\u0e5212hello34\u0e50\u0e51'),
        trimOut: new TextEncoder().encode('hello'),
        leftOut: new TextEncoder().encode('hello34\u0e50\u0e51'),
        rightOut: new TextEncoder().encode('\u0e50\u0e5212hello')
      },
      {
        f: isUpper,
        in: new TextEncoder().encode(
          '\u2C6F\u2C6F\u2C6F\u2C6FABCDhelloEF\u2C6F\u2C6FGH\u2C6F\u2C6F'
        ),
        trimOut: new TextEncoder().encode('hello'),
        leftOut: new TextEncoder().encode('helloEF\u2C6F\u2C6FGH\u2C6F\u2C6F'),
        rightOut: new TextEncoder().encode('\u2C6F\u2C6F\u2C6F\u2C6FABCDhello')
      },
      {
        f: not(isSpace),
        in: new TextEncoder().encode('hello' + space + 'hello'),
        trimOut: new TextEncoder().encode(space),
        leftOut: new TextEncoder().encode(space + 'hello'),
        rightOut: new TextEncoder().encode('hello' + space)
      },
      {
        f: not(isDigit),
        in: new TextEncoder().encode('hello\u0e50\u0e521234\u0e50\u0e51helo'),
        trimOut: new TextEncoder().encode('\u0e50\u0e521234\u0e50\u0e51'),
        leftOut: new TextEncoder().encode('\u0e50\u0e521234\u0e50\u0e51helo'),
        rightOut: new TextEncoder().encode('hello\u0e50\u0e521234\u0e50\u0e51')
      },
      {
        f: isValidRune,
        in: new Uint8Array([97, 98, 192, 97, 192, 99, 100]),
        trimOut: new Uint8Array([192, 97, 192]),
        leftOut: new Uint8Array([192, 97, 192, 99, 100]),
        rightOut: new Uint8Array([97, 98, 192, 97, 192])
      },
      {
        f: not(isValidRune),
        in: new Uint8Array([192, 97, 192]),
        trimOut: new Uint8Array([97]),
        leftOut: new Uint8Array([97, 192]),
        rightOut: new Uint8Array([192, 97])
      },
      {
        f: isSpace,
        in: new TextEncoder().encode(''),
        trimOut: new Uint8Array(),
        leftOut: new Uint8Array(),
        rightOut: new Uint8Array()
      },
      {
        f: isSpace,
        in: new TextEncoder().encode(' '),
        trimOut: new Uint8Array(),
        leftOut: new Uint8Array(),
        rightOut: new Uint8Array()
      }
    ]
    it('should work', () => {
      for (let tc of trimFuncTests) {
        const trimmers = [
          { name: 'TrimFunc', trim: trimFunc, out: tc.trimOut },
          { name: 'TrimLeftFunc', trim: trimLeftFunc, out: tc.leftOut },
          { name: 'TrimRightFunc', trim: trimRightFunc, out: tc.rightOut }
        ]
        for (let trimmer of trimmers) {
          const actual = trimmer.trim(tc.in, tc.f.f)
          expect(actual).toEqual(trimmer.out)
        }
      }
    })
  })

  describe('indexFunc', () => {
    const indexFuncTests = [
      { in: new TextEncoder().encode(''), f: isValidRune, first: -1, last: -1 },
      { in: new TextEncoder().encode('abc'), f: isDigit, first: -1, last: -1 },
      { in: new TextEncoder().encode('0123'), f: isDigit, first: 0, last: 3 },
      { in: new TextEncoder().encode('a1b'), f: isDigit, first: 1, last: 1 },
      { in: new TextEncoder().encode(space), f: isSpace, first: 0, last: 12 }, // last rune in space is 3 bytes
      {
        in: new TextEncoder().encode('\u0e50\u0e5212hello34\u0e50\u0e51'),
        f: isDigit,
        first: 0,
        last: 18
      },
      {
        in: new TextEncoder().encode(
          '\u2C6F\u2C6F\u2C6F\u2C6FABCDhelloEF\u2C6F\u2C6FGH\u2C6F\u2C6F'
        ),
        f: isUpper,
        first: 0,
        last: 34
      },
      {
        in: new TextEncoder().encode('12\u0e50\u0e52hello34\u0e50\u0e51'),
        f: not(isDigit),
        first: 8,
        last: 12
      },

      // tests of invalid UTF-8
      { in: new Uint8Array([0x80, 49]), f: isDigit, first: 1, last: 1 },
      { in: new Uint8Array([0x80, 97, 98, 99]), f: isDigit, first: -1, last: -1 },
      { in: new Uint8Array([0xc0, 97, 0xc0]), f: isValidRune, first: 1, last: 1 },
      { in: new Uint8Array([0xc0, 97, 0xc0]), f: not(isValidRune), first: 0, last: 2 },
      { in: new Uint8Array([0xc0, 226, 152, 186, 0xc0]), f: not(isValidRune), first: 0, last: 4 },
      {
        in: new Uint8Array([0xc0, 226, 152, 186, 0xc0, 0xc0]),
        f: not(isValidRune),
        first: 0,
        last: 5
      },
      {
        in: new Uint8Array([97, 98, 0xc0, 97, 0xc0, 99, 100]),
        f: not(isValidRune),
        first: 2,
        last: 4
      },
      { in: new Uint8Array([97, 0xe0, 0x80, 99, 100]), f: not(isValidRune), first: 1, last: 2 }
    ]
    it('should work', () => {
      for (let tc of indexFuncTests) {
        const first = indexFunc(tc.in, tc.f.f)
        expect(first).toEqual(tc.first)
        const last = lastIndexFunc(tc.in, tc.f.f)
        expect(last).toEqual(tc.last)
      }
    })
  })

  describe('indexRune', () => {
    const tests = [
      { in: new TextEncoder().encode(''), rune: 'a'.charCodeAt(0), want: -1 },
      { in: new TextEncoder().encode(''), rune: '☺'.charCodeAt(0), want: -1 },
      { in: new TextEncoder().encode('foo'), rune: '☹'.charCodeAt(0), want: -1 },
      { in: new TextEncoder().encode('foo'), rune: 'o'.charCodeAt(0), want: 1 },
      { in: new TextEncoder().encode('foo☺bar'), rune: '☺'.charCodeAt(0), want: 3 },
      { in: new TextEncoder().encode('foo☺☻☹bar'), rune: '☹'.charCodeAt(0), want: 9 },
      { in: new TextEncoder().encode('a A x'), rune: 'A'.charCodeAt(0), want: 2 },
      { in: new TextEncoder().encode('some_text=some_value'), rune: '='.charCodeAt(0), want: 9 },
      { in: new TextEncoder().encode('☺a'), rune: 'a'.charCodeAt(0), want: 3 },
      { in: new TextEncoder().encode('a☻☺b'), rune: '☺'.charCodeAt(0), want: 4 },

      // RuneError should match any invalid UTF-8 byte sequence.
      { in: new TextEncoder().encode('�'), rune: '�'.charCodeAt(0), want: 0 },
      { in: new Uint8Array([0xff]), rune: '�'.charCodeAt(0), want: 0 },
      { in: new TextEncoder().encode('☻x�'), rune: '�'.charCodeAt(0), want: '☻x'.length },
      {
        in: new Uint8Array([226, 152, 187, 120, 226, 152]),
        rune: '�'.charCodeAt(0),
        want: '☻x'.length
      },
      {
        in: new Uint8Array([226, 152, 187, 120, 226, 152, 239, 191, 189]),
        rune: '�'.charCodeAt(0),
        want: '☻x'.length
      },
      {
        in: new Uint8Array([226, 152, 187, 120, 226, 152, 120]),
        rune: '�'.charCodeAt(0),
        want: '☻x'.length
      },

      // Invalid rune values should never match.
      // prettier-ignore
      {
        in: new Uint8Array([ 97, 226, 152, 186, 98, 226, 152, 187, 99, 226, 152, 185, 100, 226, 152, 239, 191, 189, 255, 239, 191, 189, 237, 160, 128]),
        rune: -1,
        want: -1
      },
      // prettier-ignore
      {
        in: new Uint8Array([ 97, 226, 152, 186, 98, 226, 152, 187, 99, 226, 152, 185, 100, 226, 152, 239, 191, 189, 255, 239, 191, 189, 237, 160, 128]),
        rune: 0xd800,
        want: -1
      }, // Surrogate pair
      // prettier-ignore
      {
        in: new Uint8Array([ 97, 226, 152, 186, 98, 226, 152, 187, 99, 226, 152, 185, 100, 226, 152, 239, 191, 189, 255, 239, 191, 189, 237, 160, 128]),
        rune: MaxRune + 1,
        want: -1
      }
    ]
    it('should work', () => {
      for (let tt of tests) {
        const got = indexRune(tt.in, tt.rune)
        expect(got).toEqual(tt.want)
        const haystack = new TextEncoder().encode('test世界')
        expect(indexRune(haystack, 's'.charCodeAt(0))).toEqual(2)
        expect(indexRune(haystack, '世'.charCodeAt(0))).toEqual(4)
      }
    })
  })
})
