import { encodeRune, decodeRune, RuneError, MaxRune, validRune } from '../src/utf8'

const utf8map: [number, string][] = [
  [0x0000, '\x00'],
  [0x0001, '\x01'],
  [0x007e, '\x7e'],
  [0x007f, '\x7f'],
  [0x0080, '\xc2\x80'],
  [0x0081, '\xc2\x81'],
  [0x00bf, '\xc2\xbf'],
  [0x00c0, '\xc3\x80'],
  [0x00c1, '\xc3\x81'],
  [0x00c8, '\xc3\x88'],
  [0x00d0, '\xc3\x90'],
  [0x00e0, '\xc3\xa0'],
  [0x00f0, '\xc3\xb0'],
  [0x00f8, '\xc3\xb8'],
  [0x00ff, '\xc3\xbf'],
  [0x0100, '\xc4\x80'],
  [0x07ff, '\xdf\xbf'],
  [0x0400, '\xd0\x80'],
  [0x0800, '\xe0\xa0\x80'],
  [0x0801, '\xe0\xa0\x81'],
  [0x1000, '\xe1\x80\x80'],
  [0xd000, '\xed\x80\x80'],
  [0xd7ff, '\xed\x9f\xbf'], // last code point before surrogate half.
  [0xe000, '\xee\x80\x80'], // first code point after surrogate half.
  [0xfffe, '\xef\xbf\xbe'],
  [0xffff, '\xef\xbf\xbf'],
  [0x10000, '\xf0\x90\x80\x80'],
  [0x10001, '\xf0\x90\x80\x81'],
  [0x40000, '\xf1\x80\x80\x80'],
  [0x10fffe, '\xf4\x8f\xbf\xbe'],
  [0x10ffff, '\xf4\x8f\xbf\xbf'],
  [0xfffd, '\xef\xbf\xbd']
]

const bytes = (str: string) => {
  const b = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    b[i] = str.charCodeAt(i)
  }
  return b
}

describe('utf8 package', () => {
  describe('encodeRune', () => {
    it('should work', () => {
      for (let [r, str] of utf8map) {
        const b = new Uint8Array(str.length)
        for (let i = 0; i < str.length; i++) {
          b[i] = str.charCodeAt(i)
        }
        const buf = new Uint8Array(10)
        const n = encodeRune(buf, r)
        const b1 = buf.slice(0, n)
        expect(b1).toEqual(b)
      }
    })
  })

  describe('decodeRune', () => {
    it('should work', () => {
      for (let m of utf8map) {
        const b = bytes(m[1])
        let res = decodeRune(b)
        expect(res[0]).toEqual(m[0])
        expect(res[1]).toEqual(b.length)

        // there's an extra byte that bytes left behind - make sure trailing byte works
        res = decodeRune(b.slice(0))
        expect(res[0]).toEqual(m[0])
        expect(res[1]).toEqual(b.length)

        // make sure missing bytes fail
        let wantsize = 1
        if (wantsize >= b.length) {
          wantsize = 0
        }
        res = decodeRune(b.slice(0, b.length - 1))
        expect(res[0]).toEqual(RuneError)
        expect(res[1]).toEqual(wantsize)

        // make sure bad sequences fail
        if (b.length == 1) {
          b[0] = 0x80
        } else {
          b[b.length - 1] = 0x7f
        }
        res = decodeRune(b)
        expect(res[0]).toEqual(RuneError)
        expect(res[1]).toEqual(1)
      }
    })
  })

  describe('validRune', () => {
    const validrunetests: [number, boolean][] = [
      [0, true],
      ['e'.charCodeAt(0), true],
      ['é'.charCodeAt(0), true],
      ['☺'.charCodeAt(0), true],
      [RuneError, true],
      [MaxRune, true],
      [0xd7ff, true],
      [0xd800, false],
      [0xdfff, false],
      [0xe000, true],
      [MaxRune + 1, false],
      [-1, false]
    ]
    it('should work', () => {
      for (let tt of validrunetests) {
        expect(validRune(tt[0])).toEqual(tt[1])
      }
    })
  })
})
