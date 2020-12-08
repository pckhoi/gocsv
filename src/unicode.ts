import { decodeBytes } from './byte'

const MaxLatin1 = 255

// RangeTable defines a set of Unicode code points by listing the ranges of
// code points within the set. The ranges are listed in two slices
// to save space: a slice of 16-bit ranges and a slice of 32-bit ranges.
// The two slices must be in sorted order and non-overlapping.
// Also, R32 should contain only values >= 0x10000 (1<<16).
type RangeTable = {
  r16?: Range16[]
  r32?: Range32[]
  latinOffset: number // number of entries in R16 with Hi <= MaxLatin1
}

// Range16 represents of a range of 16-bit Unicode code points. The range runs from Lo to Hi
// inclusive and has the specified stride.
type Range16 = {
  lo: number
  hi: number
  stride: number
}

// Range32 represents of a range of Unicode code points and is used when one or
// more of the values will not fit in 16 bits. The range runs from Lo to Hi
// inclusive and has the specified stride. Lo and Hi must always be >= 1<<16.
type Range32 = {
  lo: number
  hi: number
  stride: number
}

export const White_Space = {
  r16: [
    { lo: 0x0009, hi: 0x000d, stride: 1 },
    { lo: 0x0020, hi: 0x0085, stride: 101 },
    { lo: 0x00a0, hi: 0x1680, stride: 5600 },
    { lo: 0x2000, hi: 0x200a, stride: 1 },
    { lo: 0x2028, hi: 0x2029, stride: 1 },
    { lo: 0x202f, hi: 0x205f, stride: 48 },
    { lo: 0x3000, hi: 0x3000, stride: 1 }
  ],
  latinOffset: 2
}

// linearMax is the maximum size table for linear search for non-Latin1 rune.
// Derived by running 'go test -calibrate'.
const linearMax = 18

// is16 reports whether r is in the sorted slice of 16-bit ranges.
const is16 = (ranges: Range16[], r: number) => {
  if (ranges.length <= linearMax || r <= MaxLatin1) {
    for (let i = 0; i < ranges.length; i++) {
      const range_ = ranges[i]
      if (r < range_.lo) {
        return false
      }
      if (r <= range_.hi) {
        return range_.stride == 1 || (r - range_.lo) % range_.stride == 0
      }
    }
    return false
  }

  // binary search over ranges
  let lo = 0
  let hi = ranges.length
  while (lo < hi) {
    const m = lo + (hi - lo) / 2
    const range_ = ranges[m]
    if (range_.lo <= r && r <= range_.hi) {
      return range_.stride == 1 || (r - range_.lo) % range_.stride == 0
    }
    if (r < range_.lo) {
      hi = m
    } else {
      lo = m + 1
    }
  }
  return false
}

// is32 reports whether r is in the sorted slice of 32-bit ranges.
const is32 = (ranges: Range32[], r: number) => {
  if (ranges.length <= linearMax) {
    for (let i = 0; i < ranges.length; i++) {
      const range_ = ranges[i]
      if (r < range_.lo) {
        return false
      }
      if (r <= range_.hi) {
        return range_.stride == 1 || (r - range_.lo) % range_.stride == 0
      }
    }
    return false
  }

  // binary search over ranges
  let lo = 0
  let hi = ranges.length
  while (lo < hi) {
    const m = lo + (hi - lo) / 2
    const range_ = ranges[m]
    if (range_.lo <= r && r <= range_.hi) {
      return range_.stride == 1 || (r - range_.lo) % range_.stride == 0
    }
    if (r < range_.lo) {
      hi = m
    } else {
      lo = m + 1
    }
  }
  return false
}

const isExcludingLatin = (rangeTab: RangeTable, r: number) => {
  const r16 = rangeTab.r16
  const off = rangeTab.latinOffset
  if (r16 && r16.length > off && r <= r16[r16.length - 1].hi) {
    return is16(r16.slice(off), r)
  }
  const r32 = rangeTab.r32
  if (r32 && r32.length > 0 && r >= r32[0].lo) {
    return is32(r32, r)
  }
  return false
}

export const isSpace = (r: number) => {
  // This property isn't the same as Z; special-case it.
  if (r <= MaxLatin1) {
    switch (r) {
      case 0x85:
      case 0xa0:
        return true
    }
    switch (decodeBytes(new Uint8Array([r]))) {
      case '\t':
      case '\n':
      case '\v':
      case '\f':
      case '\r':
      case ' ':
        return true
    }
    return false
  }
  return isExcludingLatin(White_Space, r)
}
