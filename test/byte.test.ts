import { equal, trimLeftFunc, trimFunc, trimRightFunc, indexFunc, lastIndexFunc } from '../src/byte'
import * as unicode from '../src/unicode'
import { RuneError } from '../src/utf8'
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
        in: space + ' hello ' + space,
        trimOut: new TextEncoder().encode('hello'),
        leftOut: new TextEncoder().encode('hello ' + space),
        rightOut: new TextEncoder().encode(space + ' hello')
      },
      {
        f: isDigit,
        in: '\u0e50\u0e5212hello34\u0e50\u0e51',
        trimOut: new TextEncoder().encode('hello'),
        leftOut: new TextEncoder().encode('hello34\u0e50\u0e51'),
        rightOut: new TextEncoder().encode('\u0e50\u0e5212hello')
      },
      {
        f: isUpper,
        in: '\u2C6F\u2C6F\u2C6F\u2C6FABCDhelloEF\u2C6F\u2C6FGH\u2C6F\u2C6F',
        trimOut: new TextEncoder().encode('hello'),
        leftOut: new TextEncoder().encode('helloEF\u2C6F\u2C6FGH\u2C6F\u2C6F'),
        rightOut: new TextEncoder().encode('\u2C6F\u2C6F\u2C6F\u2C6FABCDhello')
      },
      {
        f: not(isSpace),
        in: 'hello' + space + 'hello',
        trimOut: new TextEncoder().encode(space),
        leftOut: new TextEncoder().encode(space + 'hello'),
        rightOut: new TextEncoder().encode('hello' + space)
      },
      {
        f: not(isDigit),
        in: 'hello\u0e50\u0e521234\u0e50\u0e51helo',
        trimOut: new TextEncoder().encode('\u0e50\u0e521234\u0e50\u0e51'),
        leftOut: new TextEncoder().encode('\u0e50\u0e521234\u0e50\u0e51helo'),
        rightOut: new TextEncoder().encode('hello\u0e50\u0e521234\u0e50\u0e51')
      },
      {
        f: isValidRune,
        inb: new Uint8Array([97, 98, 192, 97, 192, 99, 100]),
        trimOut: new Uint8Array([192, 97, 192]),
        leftOut: new Uint8Array([192, 97, 192, 99, 100]),
        rightOut: new Uint8Array([97, 98, 192, 97, 192])
      },
      {
        f: not(isValidRune),
        inb: new Uint8Array([192, 97, 192]),
        trimOut: new Uint8Array([97]),
        leftOut: new Uint8Array([97, 192]),
        rightOut: new Uint8Array([192, 97])
      },
      {
        f: isSpace,
        in: '',
        trimOut: new Uint8Array(),
        leftOut: new Uint8Array(),
        rightOut: new Uint8Array()
      },
      {
        f: isSpace,
        in: ' ',
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
          let b
          if (tc.inb) {
            b = tc.inb
          } else {
            b = new TextEncoder().encode(tc.in)
          }
          const actual = trimmer.trim(b, tc.f.f)
          expect(actual).toEqual(trimmer.out)
        }
      }
    })
  })

  describe('indexFunc', () => {
    const indexFuncTests = [
      { in: '', f: isValidRune, first: -1, last: -1 },
      { in: 'abc', f: isDigit, first: -1, last: -1 },
      { in: '0123', f: isDigit, first: 0, last: 3 },
      { in: 'a1b', f: isDigit, first: 1, last: 1 },
      { in: space, f: isSpace, first: 0, last: 12 }, // last rune in space is 3 bytes
      { in: '\u0e50\u0e5212hello34\u0e50\u0e51', f: isDigit, first: 0, last: 18 },
      {
        in: '\u2C6F\u2C6F\u2C6F\u2C6FABCDhelloEF\u2C6F\u2C6FGH\u2C6F\u2C6F',
        f: isUpper,
        first: 0,
        last: 34
      },
      { in: '12\u0e50\u0e52hello34\u0e50\u0e51', f: not(isDigit), first: 8, last: 12 },

      // tests of invalid UTF-8
      { inb: new Uint8Array([0x80, 49]), f: isDigit, first: 1, last: 1 },
      { inb: new Uint8Array([0x80, 97, 98, 99]), f: isDigit, first: -1, last: -1 },
      { inb: new Uint8Array([0xc0, 97, 0xc0]), f: isValidRune, first: 1, last: 1 },
      { inb: new Uint8Array([0xc0, 97, 0xc0]), f: not(isValidRune), first: 0, last: 2 },
      { inb: new Uint8Array([0xc0, 226, 152, 186, 0xc0]), f: not(isValidRune), first: 0, last: 4 },
      {
        inb: new Uint8Array([0xc0, 226, 152, 186, 0xc0, 0xc0]),
        f: not(isValidRune),
        first: 0,
        last: 5
      },
      {
        inb: new Uint8Array([97, 98, 0xc0, 97, 0xc0, 99, 100]),
        f: not(isValidRune),
        first: 2,
        last: 4
      },
      { inb: new Uint8Array([97, 0xe0, 0x80, 99, 100]), f: not(isValidRune), first: 1, last: 2 }
    ]
    it('should work', () => {
      for (let tc of indexFuncTests) {
        let b
        if (tc.inb) {
          b = tc.inb
        } else {
          b = new TextEncoder().encode(tc.in)
        }
        const first = indexFunc(b, tc.f.f)
        expect(first).toEqual(tc.first)
        const last = lastIndexFunc(b, tc.f.f)
        expect(last).toEqual(tc.last)
      }
    })
  })
})
