import {
  decodeLastRune,
  decodeRune,
  encodeRune,
  RuneError,
  RuneSelf,
  UTFMax,
  validRune,
} from './utf8'

export const bytes = (s: string) => {
  return new TextEncoder().encode(s)
}

export const byte = (s: string) => s.charCodeAt(0)

export const decodeBytes = (b: Uint8Array) => new TextDecoder().decode(b)

export const appendBytesArray = (a: Uint8Array, b: Uint8Array) => {
  const c = new Uint8Array(a.length + b.length)
  c.set(a)
  c.set(b, a.length)
  return c
}

// indexFunc interprets s as a sequence of UTF-8-encoded code points.
// It returns the byte index in s of the first Unicode
// code point satisfying f(c), or -1 if none do.
export const indexFunc = (s: Uint8Array, f: (r: number) => boolean) => {
  return _indexFunc(s, f, true)
}

// indexFunc is the same as IndexFunc except that if
// truth==false, the sense of the predicate function is
// inverted.
const _indexFunc = (s: Uint8Array, f: (r: number) => boolean, truth: boolean) => {
  let start = 0
  while (start < s.length) {
    let wid = 1
    let r = s[start]
    if (r >= RuneSelf) {
      const [_r, _wid] = decodeRune(s.slice(start))
      r = _r
      wid = _wid
    }
    if (f(r) === truth) {
      return start
    }
    start += wid
  }
  return -1
}

// IndexRune interprets s as a sequence of UTF-8-encoded code points.
// It returns the byte index of the first occurrence in s of the given rune.
// It returns -1 if rune is not present in s.
// If r is utf8.RuneError, it returns the first instance of any
// invalid UTF-8 byte sequence.
export const indexRune = (s: Uint8Array, r: number): number => {
  if (0 <= r && r < RuneSelf) {
    // if (r === 65) throw new Error(`r: ${r}, s: ${s}, index: ${s.indexOf(r)}`)
    return s.indexOf(r)
  }
  if (r === RuneError) {
    let i = 0
    let j = 0
    while (i < s.length) {
      const [r1, n] = decodeRune(s.slice(i))
      if (r1 === RuneError) {
        return j
      }
      i += n
      j++
    }
    return -1
  }
  // if (r === 65) throw new Error(`r: ${r}, valid: ${validRune(r)}`)
  if (!validRune(r)) return -1

  const b = new Uint8Array(UTFMax)
  const n = encodeRune(b, r)
  // if (r === 65) throw new Error(`r: ${r}, b: ${b}, n: ${n}`)
  return index(s, b.slice(0, n))
}

// LastIndexFunc interprets s as a sequence of UTF-8-encoded code points.
// It returns the byte index in s of the last Unicode
// code point satisfying f(c), or -1 if none do.
export const lastIndexFunc = (s: Uint8Array, f: (r: number) => boolean): number => {
  return _lastIndexFunc(s, f, true)
}

// lastIndexFunc is the same as LastIndexFunc except that if
// truth==false, the sense of the predicate function is
// inverted.
const _lastIndexFunc = (s: Uint8Array, f: (r: number) => boolean, truth: boolean) => {
  let i = s.length
  while (i > 0) {
    let r = s[i - 1]
    let size = 1
    if (r >= RuneSelf) {
      const res = decodeLastRune(s.slice(0, i))
      r = res[0]
      size = res[1]
    }
    i -= size
    if (f(r) === truth) {
      return i
    }
  }
  return -1
}

// TrimLeftFunc treats s as UTF-8-encoded bytes and returns a subslice of s by slicing off
// all leading UTF-8-encoded code points c that satisfy f(c).
export const trimLeftFunc = (s: Uint8Array, f: (r: number) => boolean) => {
  const i = _indexFunc(s, f, false)
  if (i === -1) {
    return new Uint8Array()
  }
  return s.slice(i)
}

// TrimRightFunc returns a subslice of s by slicing off all trailing
// UTF-8-encoded code points c that satisfy f(c).
export const trimRightFunc = (s: Uint8Array, f: (r: number) => boolean) => {
  let i = _lastIndexFunc(s, f, false)
  if (i >= 0 && s[i] >= RuneSelf) {
    const [_, wid] = decodeRune(s.slice(i))
    i += wid
  } else {
    i++
  }
  return s.slice(0, i)
}

// TrimFunc returns a subslice of s by slicing off all leading and trailing
// UTF-8-encoded code points c that satisfy f(c).
export const trimFunc = (s: Uint8Array, f: (r: number) => boolean): Uint8Array => {
  return trimRightFunc(trimLeftFunc(s, f), f)
}

export const equal = (a: Uint8Array, b: Uint8Array) => {
  return a.length === b.length && a.every((elem, index) => elem === b[index])
}

const MaxBruteForce = 64

export const cutover = (n: number): number => {
  // 1 error per 8 characters, plus a few slop to start.
  return (n + 16) / 8
}

// // PrimeRK is the prime base used in Rabin-Karp algorithm.
// const PrimeRK = 16777619
// const MaxUint32 = 4294967295

// // HashStrBytes returns the hash and the appropriate multiplicative
// // factor for use in Rabin-Karp algorithm.
// export const hashStrBytes = (sep: Uint8Array): [number, number] => {
//   let hash = 0
//   for (let i = 0; i < sep.length; i++) {
//     const res = hash * PrimeRK + sep[i]
//     if (res > MaxUint32) {
//       hash = res >>> 0
//     } else {
//       hash = res
//     }
//   }
//   let pow = 1
//   let sq = PrimeRK
//   for (let i = sep.length; i > 0; i >>= 1) {
//     if ((i & 1) !== 0) {
//       if (pow * sq === 0 || (pow * sq) >>> 0 === 0) {
//         throw new Error(`pow: ${pow}, sq: ${sq}`)
//       }
//       pow *= sq
//       if (pow > MaxUint32) {
//         pow = pow >>> 0
//       }
//     }
//     if (sq * sq === 0 || (sq * sq) >>> 0 === 0) throw new Error(`sq: ${sq}`)
//     sq *= sq
//     if (sq > MaxUint32) {
//       sq = sq >>> 0
//     }
//   }
//   return [hash, pow]
// }

// // IndexRabinKarpBytes uses the Rabin-Karp search algorithm to return the index of the
// // first occurence of substr in s, or -1 if not present.
// export const indexRabinKarpBytes = (s: Uint8Array, sep: Uint8Array): number => {
//   // Rabin-Karp search
//   const [hashsep, pow] = hashStrBytes(sep)
//   const n = sep.length
//   let h = 0
//   for (let i = 0; i < n; i++) {
//     h = h * PrimeRK + s[i]
//   }
//   if (h === hashsep && equal(s.slice(0, n), sep)) {
//     return 0
//   }
//   let i = n
//   while (i < s.length) {
//     h *= PrimeRK
//     h += s[i]
//     h -= pow * s[i - n]
//     i++
//     if (h === hashsep && equal(s.slice(i - n, i), sep)) {
//       return i - n
//     }
//   }
//   return -1
// }

// Index returns the index of the first instance of sep in s, or -1 if sep is not present in s.
export const index = (s: Uint8Array, sep: Uint8Array): number => {
  const n = sep.length
  if (n === 0) {
    return 0
  }
  if (n === 1) {
    return s.indexOf(sep[0])
  }
  if (n === s.length) {
    if (equal(sep, s)) {
      return 0
    }
    return -1
  }
  if (n > s.length) {
    return -1
  }
  if (n <= 63) {
    // Use brute force when s and sep both are small
    const c0 = sep[0]
    const c1 = sep[1]
    let i = 0
    const t = s.length - n + 1
    let fails = 0
    while (i < t) {
      if (s[i] !== c0) {
        const o = s.slice(i + 1, t).indexOf(c0)
        if (o < 0) {
          return -1
        }
        i += o + 1
      }
      if (s[i + 1] === c1 && equal(s.slice(i, i + n), sep)) {
        return i
      }
      fails++
      i++
    }
    return -1
  }
  const c0 = sep[0]
  const c1 = sep[1]
  let i = 0
  let fails = 0
  const t = s.length - n + 1
  while (i < t) {
    if (s[i] !== c0) {
      const o = s.slice(i + 1, t).indexOf(c0)
      if (o < 0) {
        break
      }
      i += o + 1
    }
    if (s[i + 1] === c1 && equal(s.slice(i, i + n), sep)) {
      return i
    }
    i++
    fails++
    // if (fails >= (4 + i) >> 4 && i < t) {
    //   // Give up on IndexByte, it isn't skipping ahead
    //   // far enough to be better than Rabin-Karp.
    //   // Experiments (using IndexPeriodic) suggest
    //   // the cutover is about 16 byte skips.
    //   // TODO: if large prefixes of sep are matching
    //   // we should cutover at even larger average skips,
    //   // because Equal becomes that much more expensive.
    //   // This code does not take that effect into account.
    //   const j = indexRabinKarpBytes(s.slice(i), sep)
    //   if (j < 0) {
    //     return -1
    //   }
    //   return i + j
    // }
  }
  return -1
}

export const bytesLength = (n: number) => {
  if (!n) return 0
  let l = 1
  while (n >= 256) {
    n = n >>> 8
    l += 1
  }
  return l
}

export const bytesArray = (n: number) => {
  if (!n) return new Uint8Array()
  const a = []
  a.unshift(n & 255)
  while (n >= 256) {
    n = n >>> 8
    a.unshift(n & 255)
  }
  return new Uint8Array(a)
}

export const bytesSlice = (a: Uint8Array, start: number, end?: number): Uint8Array => {
  return new Uint8Array(
    a.buffer,
    a.byteOffset + start,
    end === undefined ? a.byteLength - start : end - start
  )
}
