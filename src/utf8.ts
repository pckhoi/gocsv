const stringToNum = (s: string) => {
  const a = new Uint8Array(4)
  a.set(new TextEncoder().encode(s))
  return new DataView(a.buffer).getUint32(0)
}

const numToString = (n: number) => {
  const dv = new DataView(new Uint8Array(4).buffer)
  dv.setUint32(0, n)
  const b = new Uint8Array(dv.buffer)
  return new TextDecoder().decode(b)
}

export const RuneError = 0xfffd // the "error" Rune or "Unicode replacement character"
export const RuneSelf = 0x80 // characters below RuneSelf are represented as themselves in a single byte.
export const MaxRune = 0x0010ffff // Maximum valid Unicode code point.
export const UTFMax = 4 // maximum number of bytes of a UTF-8 encoded Unicode character.

const t1 = 0b00000000
const tx = 0b10000000
const t2 = 0b11000000
const t3 = 0b11100000
const t4 = 0b11110000
const t5 = 0b11111000

const maskx = 0b00111111
const mask2 = 0b00011111
const mask3 = 0b00001111
const mask4 = 0b00000111

const rune1Max = (1 << 7) - 1
const rune2Max = (1 << 11) - 1
const rune3Max = (1 << 16) - 1

// The default lowest and highest continuation byte.
const locb = 0b10000000
const hicb = 0b10111111

// These names of these constants are chosen to give nice alignment in the
// table below. The first nibble is an index into acceptRanges or F for
// special one-byte cases. The second nibble is the Rune length or the
// Status for the special one-byte case.
const xx = 0xf1 // invalid: size 1
const as = 0xf0 // ASCII: size 1
const s1 = 0x02 // accept 0, size 2
const s2 = 0x13 // accept 1, size 3
const s3 = 0x03 // accept 0, size 3
const s4 = 0x23 // accept 2, size 3
const s5 = 0x34 // accept 3, size 4
const s6 = 0x04 // accept 0, size 4
const s7 = 0x44 // accept 4, size 4

// first is information about the first byte in a UTF-8 sequence.
// prettier-ignore
const  first = [
	//   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x00-0x0F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x10-0x1F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x20-0x2F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x30-0x3F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x40-0x4F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x50-0x5F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x60-0x6F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x70-0x7F
	//   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0x80-0x8F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0x90-0x9F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xA0-0xAF
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xB0-0xBF
	xx, xx, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, // 0xC0-0xCF
	s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, // 0xD0-0xDF
	s2, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s4, s3, s3, // 0xE0-0xEF
	s5, s6, s6, s6, s7, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xF0-0xFF
]

// acceptRange gives the range of valid values for the second byte in a UTF-8
// sequence.
type acceptRange = {
  lo: number // lowest value for second byte.
  hi: number // highest value for second byte.
}

// acceptRanges has size 16 to avoid bounds checks in the code that uses it.
const acceptRanges = [
  { lo: locb, hi: hicb },
  { lo: 0xa0, hi: hicb },
  { lo: locb, hi: 0x9f },
  { lo: 0x90, hi: hicb },
  { lo: locb, hi: 0x8f }
]
acceptRanges.length = 16

// DecodeRune unpacks the first UTF-8 encoding in p and returns the rune and
// its width in bytes. If p is empty it returns (RuneError, 0). Otherwise, if
// the encoding is invalid, it returns (RuneError, 1). Both are impossible
// results for correct, non-empty UTF-8.
//
// An encoding is invalid if it is incorrect UTF-8, encodes a rune that is
// out of range, or is not the shortest possible UTF-8 encoding for the
// value. No other validation is performed.
export const decodeRune = (p: Uint8Array): [number, number] => {
  const n = p.length
  if (n < 1) {
    return [RuneError, 0]
  }
  const p0 = p[0]
  const x = first[p0]
  if (x >= as) {
    // The following code simulates an additional check for x == xx and
    // handling the ASCII and invalid cases accordingly. This mask-and-or
    // approach prevents an additional branch.
    const mask = (x << 31) >> 31 // Create 0x0000 or 0xFFFF.
    return [(p[0] & ~mask) | (RuneError & mask), 1]
  }
  const sz = x & 7
  const accept = acceptRanges[x >> 4]
  if (n < sz) {
    return [RuneError, 1]
  }
  const b1 = p[1]
  if (b1 < accept.lo || accept.hi < b1) {
    return [RuneError, 1]
  }
  if (sz <= 2) {
    // <= instead of == to help the compiler eliminate some bounds checks
    return [((p0 & mask2) << 6) | (b1 & maskx), 2]
  }
  const b2 = p[2]
  if (b2 < locb || hicb < b2) {
    return [RuneError, 1]
  }
  if (sz <= 3) {
    return [((p0 & mask3) << 12) | ((b1 & maskx) << 6) | (b2 & maskx), 3]
  }
  const b3 = p[3]
  if (b3 < locb || hicb < b3) {
    return [RuneError, 1]
  }
  return [((p0 & mask4) << 18) | ((b1 & maskx) << 12) | ((b2 & maskx) << 6) | (b3 & maskx), 4]
}

// EncodeRune writes into p (which must be large enough) the UTF-8 encoding of the rune.
// It returns the number of bytes written.
export const encodeRune = (p: Uint8Array, r: number): number => {
  // Negative values are erroneous. Making it unsigned addresses the problem.
  if (r <= rune1Max) {
    p[0] = r
    return 1
  } else if (r <= rune2Max) {
    p[0] = t2 | (r >> 6)
    p[1] = tx | (r & maskx)
    return 2
  } else {
    if (r > MaxRune || (surrogateMin <= r && r <= surrogateMax)) {
      r = RuneError
    }
    if (r <= rune3Max) {
      p[0] = t3 | (r >> 12)
      p[1] = tx | ((r >> 6) & maskx)
      p[2] = tx | (r & maskx)
      return 3
    } else {
      p[0] = t4 | (r >> 18)
      p[1] = tx | ((r >> 12) & maskx)
      p[2] = tx | ((r >> 6) & maskx)
      p[3] = tx | (r & maskx)
      return 4
    }
  }
}

const surrogateMin = 0xd800
const surrogateMax = 0xdfff

// ValidRune reports whether r can be legally encoded as UTF-8.
// Code points that are out of range or a surrogate half are illegal.
export const validRune = (r: number) => {
  if (0 <= r && r < surrogateMin) return true
  if (surrogateMax < r && r <= MaxRune) return true
  return false
}

// RuneStart reports whether the byte could be the first byte of an encoded,
// possibly invalid rune. Second and subsequent bytes always have the top two
// bits set to 10.
export const runeStart = (b: number): boolean => {
  return (b & 0xc0) !== 0x80
}

// DecodeLastRune unpacks the last UTF-8 encoding in p and returns the rune and
// its width in bytes. If p is empty it returns (RuneError, 0). Otherwise, if
// the encoding is invalid, it returns (RuneError, 1). Both are impossible
// results for correct, non-empty UTF-8.
//
// An encoding is invalid if it is incorrect UTF-8, encodes a rune that is
// out of range, or is not the shortest possible UTF-8 encoding for the
// value. No other validation is performed.
export const decodeLastRune = (p: Uint8Array): [number, number] => {
  const end = p.length
  if (end === 0) {
    return [RuneError, 0]
  }
  let start = end - 1
  let r = p[start]
  if (r < RuneSelf) {
    return [r, 1]
  }
  // guard against O(n^2) behavior when traversing
  // backwards through strings with long sequences of
  // invalid UTF-8.
  let lim = end - UTFMax
  if (lim < 0) {
    lim = 0
  }
  for (start--; start >= lim; start--) {
    if (runeStart(p[start])) {
      break
    }
  }
  if (start < 0) {
    start = 0
  }
  const res = decodeRune(p.slice(start, end))
  r = res[0]
  const size = res[1]
  if (start + size != end) {
    return [RuneError, 1]
  }
  return [r, size]
}
