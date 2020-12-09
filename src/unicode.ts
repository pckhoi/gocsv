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

const _Nd = {
  r16: [
    { lo: 0x0030, hi: 0x0039, stride: 1 },
    { lo: 0x0660, hi: 0x0669, stride: 1 },
    { lo: 0x06f0, hi: 0x06f9, stride: 1 },
    { lo: 0x07c0, hi: 0x07c9, stride: 1 },
    { lo: 0x0966, hi: 0x096f, stride: 1 },
    { lo: 0x09e6, hi: 0x09ef, stride: 1 },
    { lo: 0x0a66, hi: 0x0a6f, stride: 1 },
    { lo: 0x0ae6, hi: 0x0aef, stride: 1 },
    { lo: 0x0b66, hi: 0x0b6f, stride: 1 },
    { lo: 0x0be6, hi: 0x0bef, stride: 1 },
    { lo: 0x0c66, hi: 0x0c6f, stride: 1 },
    { lo: 0x0ce6, hi: 0x0cef, stride: 1 },
    { lo: 0x0d66, hi: 0x0d6f, stride: 1 },
    { lo: 0x0de6, hi: 0x0def, stride: 1 },
    { lo: 0x0e50, hi: 0x0e59, stride: 1 },
    { lo: 0x0ed0, hi: 0x0ed9, stride: 1 },
    { lo: 0x0f20, hi: 0x0f29, stride: 1 },
    { lo: 0x1040, hi: 0x1049, stride: 1 },
    { lo: 0x1090, hi: 0x1099, stride: 1 },
    { lo: 0x17e0, hi: 0x17e9, stride: 1 },
    { lo: 0x1810, hi: 0x1819, stride: 1 },
    { lo: 0x1946, hi: 0x194f, stride: 1 },
    { lo: 0x19d0, hi: 0x19d9, stride: 1 },
    { lo: 0x1a80, hi: 0x1a89, stride: 1 },
    { lo: 0x1a90, hi: 0x1a99, stride: 1 },
    { lo: 0x1b50, hi: 0x1b59, stride: 1 },
    { lo: 0x1bb0, hi: 0x1bb9, stride: 1 },
    { lo: 0x1c40, hi: 0x1c49, stride: 1 },
    { lo: 0x1c50, hi: 0x1c59, stride: 1 },
    { lo: 0xa620, hi: 0xa629, stride: 1 },
    { lo: 0xa8d0, hi: 0xa8d9, stride: 1 },
    { lo: 0xa900, hi: 0xa909, stride: 1 },
    { lo: 0xa9d0, hi: 0xa9d9, stride: 1 },
    { lo: 0xa9f0, hi: 0xa9f9, stride: 1 },
    { lo: 0xaa50, hi: 0xaa59, stride: 1 },
    { lo: 0xabf0, hi: 0xabf9, stride: 1 },
    { lo: 0xff10, hi: 0xff19, stride: 1 }
  ],
  r32: [
    { lo: 0x104a0, hi: 0x104a9, stride: 1 },
    { lo: 0x10d30, hi: 0x10d39, stride: 1 },
    { lo: 0x11066, hi: 0x1106f, stride: 1 },
    { lo: 0x110f0, hi: 0x110f9, stride: 1 },
    { lo: 0x11136, hi: 0x1113f, stride: 1 },
    { lo: 0x111d0, hi: 0x111d9, stride: 1 },
    { lo: 0x112f0, hi: 0x112f9, stride: 1 },
    { lo: 0x11450, hi: 0x11459, stride: 1 },
    { lo: 0x114d0, hi: 0x114d9, stride: 1 },
    { lo: 0x11650, hi: 0x11659, stride: 1 },
    { lo: 0x116c0, hi: 0x116c9, stride: 1 },
    { lo: 0x11730, hi: 0x11739, stride: 1 },
    { lo: 0x118e0, hi: 0x118e9, stride: 1 },
    { lo: 0x11c50, hi: 0x11c59, stride: 1 },
    { lo: 0x11d50, hi: 0x11d59, stride: 1 },
    { lo: 0x11da0, hi: 0x11da9, stride: 1 },
    { lo: 0x16a60, hi: 0x16a69, stride: 1 },
    { lo: 0x16b50, hi: 0x16b59, stride: 1 },
    { lo: 0x1d7ce, hi: 0x1d7ff, stride: 1 },
    { lo: 0x1e140, hi: 0x1e149, stride: 1 },
    { lo: 0x1e2f0, hi: 0x1e2f9, stride: 1 },
    { lo: 0x1e950, hi: 0x1e959, stride: 1 }
  ],
  latinOffset: 1
}

const _Lu = {
  r16: [
    { lo: 0x0041, hi: 0x005a, stride: 1 },
    { lo: 0x00c0, hi: 0x00d6, stride: 1 },
    { lo: 0x00d8, hi: 0x00de, stride: 1 },
    { lo: 0x0100, hi: 0x0136, stride: 2 },
    { lo: 0x0139, hi: 0x0147, stride: 2 },
    { lo: 0x014a, hi: 0x0178, stride: 2 },
    { lo: 0x0179, hi: 0x017d, stride: 2 },
    { lo: 0x0181, hi: 0x0182, stride: 1 },
    { lo: 0x0184, hi: 0x0186, stride: 2 },
    { lo: 0x0187, hi: 0x0189, stride: 2 },
    { lo: 0x018a, hi: 0x018b, stride: 1 },
    { lo: 0x018e, hi: 0x0191, stride: 1 },
    { lo: 0x0193, hi: 0x0194, stride: 1 },
    { lo: 0x0196, hi: 0x0198, stride: 1 },
    { lo: 0x019c, hi: 0x019d, stride: 1 },
    { lo: 0x019f, hi: 0x01a0, stride: 1 },
    { lo: 0x01a2, hi: 0x01a6, stride: 2 },
    { lo: 0x01a7, hi: 0x01a9, stride: 2 },
    { lo: 0x01ac, hi: 0x01ae, stride: 2 },
    { lo: 0x01af, hi: 0x01b1, stride: 2 },
    { lo: 0x01b2, hi: 0x01b3, stride: 1 },
    { lo: 0x01b5, hi: 0x01b7, stride: 2 },
    { lo: 0x01b8, hi: 0x01bc, stride: 4 },
    { lo: 0x01c4, hi: 0x01cd, stride: 3 },
    { lo: 0x01cf, hi: 0x01db, stride: 2 },
    { lo: 0x01de, hi: 0x01ee, stride: 2 },
    { lo: 0x01f1, hi: 0x01f4, stride: 3 },
    { lo: 0x01f6, hi: 0x01f8, stride: 1 },
    { lo: 0x01fa, hi: 0x0232, stride: 2 },
    { lo: 0x023a, hi: 0x023b, stride: 1 },
    { lo: 0x023d, hi: 0x023e, stride: 1 },
    { lo: 0x0241, hi: 0x0243, stride: 2 },
    { lo: 0x0244, hi: 0x0246, stride: 1 },
    { lo: 0x0248, hi: 0x024e, stride: 2 },
    { lo: 0x0370, hi: 0x0372, stride: 2 },
    { lo: 0x0376, hi: 0x037f, stride: 9 },
    { lo: 0x0386, hi: 0x0388, stride: 2 },
    { lo: 0x0389, hi: 0x038a, stride: 1 },
    { lo: 0x038c, hi: 0x038e, stride: 2 },
    { lo: 0x038f, hi: 0x0391, stride: 2 },
    { lo: 0x0392, hi: 0x03a1, stride: 1 },
    { lo: 0x03a3, hi: 0x03ab, stride: 1 },
    { lo: 0x03cf, hi: 0x03d2, stride: 3 },
    { lo: 0x03d3, hi: 0x03d4, stride: 1 },
    { lo: 0x03d8, hi: 0x03ee, stride: 2 },
    { lo: 0x03f4, hi: 0x03f7, stride: 3 },
    { lo: 0x03f9, hi: 0x03fa, stride: 1 },
    { lo: 0x03fd, hi: 0x042f, stride: 1 },
    { lo: 0x0460, hi: 0x0480, stride: 2 },
    { lo: 0x048a, hi: 0x04c0, stride: 2 },
    { lo: 0x04c1, hi: 0x04cd, stride: 2 },
    { lo: 0x04d0, hi: 0x052e, stride: 2 },
    { lo: 0x0531, hi: 0x0556, stride: 1 },
    { lo: 0x10a0, hi: 0x10c5, stride: 1 },
    { lo: 0x10c7, hi: 0x10cd, stride: 6 },
    { lo: 0x13a0, hi: 0x13f5, stride: 1 },
    { lo: 0x1c90, hi: 0x1cba, stride: 1 },
    { lo: 0x1cbd, hi: 0x1cbf, stride: 1 },
    { lo: 0x1e00, hi: 0x1e94, stride: 2 },
    { lo: 0x1e9e, hi: 0x1efe, stride: 2 },
    { lo: 0x1f08, hi: 0x1f0f, stride: 1 },
    { lo: 0x1f18, hi: 0x1f1d, stride: 1 },
    { lo: 0x1f28, hi: 0x1f2f, stride: 1 },
    { lo: 0x1f38, hi: 0x1f3f, stride: 1 },
    { lo: 0x1f48, hi: 0x1f4d, stride: 1 },
    { lo: 0x1f59, hi: 0x1f5f, stride: 2 },
    { lo: 0x1f68, hi: 0x1f6f, stride: 1 },
    { lo: 0x1fb8, hi: 0x1fbb, stride: 1 },
    { lo: 0x1fc8, hi: 0x1fcb, stride: 1 },
    { lo: 0x1fd8, hi: 0x1fdb, stride: 1 },
    { lo: 0x1fe8, hi: 0x1fec, stride: 1 },
    { lo: 0x1ff8, hi: 0x1ffb, stride: 1 },
    { lo: 0x2102, hi: 0x2107, stride: 5 },
    { lo: 0x210b, hi: 0x210d, stride: 1 },
    { lo: 0x2110, hi: 0x2112, stride: 1 },
    { lo: 0x2115, hi: 0x2119, stride: 4 },
    { lo: 0x211a, hi: 0x211d, stride: 1 },
    { lo: 0x2124, hi: 0x212a, stride: 2 },
    { lo: 0x212b, hi: 0x212d, stride: 1 },
    { lo: 0x2130, hi: 0x2133, stride: 1 },
    { lo: 0x213e, hi: 0x213f, stride: 1 },
    { lo: 0x2145, hi: 0x2183, stride: 62 },
    { lo: 0x2c00, hi: 0x2c2e, stride: 1 },
    { lo: 0x2c60, hi: 0x2c62, stride: 2 },
    { lo: 0x2c63, hi: 0x2c64, stride: 1 },
    { lo: 0x2c67, hi: 0x2c6d, stride: 2 },
    { lo: 0x2c6e, hi: 0x2c70, stride: 1 },
    { lo: 0x2c72, hi: 0x2c75, stride: 3 },
    { lo: 0x2c7e, hi: 0x2c80, stride: 1 },
    { lo: 0x2c82, hi: 0x2ce2, stride: 2 },
    { lo: 0x2ceb, hi: 0x2ced, stride: 2 },
    { lo: 0x2cf2, hi: 0xa640, stride: 31054 },
    { lo: 0xa642, hi: 0xa66c, stride: 2 },
    { lo: 0xa680, hi: 0xa69a, stride: 2 },
    { lo: 0xa722, hi: 0xa72e, stride: 2 },
    { lo: 0xa732, hi: 0xa76e, stride: 2 },
    { lo: 0xa779, hi: 0xa77d, stride: 2 },
    { lo: 0xa77e, hi: 0xa786, stride: 2 },
    { lo: 0xa78b, hi: 0xa78d, stride: 2 },
    { lo: 0xa790, hi: 0xa792, stride: 2 },
    { lo: 0xa796, hi: 0xa7aa, stride: 2 },
    { lo: 0xa7ab, hi: 0xa7ae, stride: 1 },
    { lo: 0xa7b0, hi: 0xa7b4, stride: 1 },
    { lo: 0xa7b6, hi: 0xa7be, stride: 2 },
    { lo: 0xa7c2, hi: 0xa7c4, stride: 2 },
    { lo: 0xa7c5, hi: 0xa7c6, stride: 1 },
    { lo: 0xff21, hi: 0xff3a, stride: 1 }
  ],
  r32: [
    { lo: 0x10400, hi: 0x10427, stride: 1 },
    { lo: 0x104b0, hi: 0x104d3, stride: 1 },
    { lo: 0x10c80, hi: 0x10cb2, stride: 1 },
    { lo: 0x118a0, hi: 0x118bf, stride: 1 },
    { lo: 0x16e40, hi: 0x16e5f, stride: 1 },
    { lo: 0x1d400, hi: 0x1d419, stride: 1 },
    { lo: 0x1d434, hi: 0x1d44d, stride: 1 },
    { lo: 0x1d468, hi: 0x1d481, stride: 1 },
    { lo: 0x1d49c, hi: 0x1d49e, stride: 2 },
    { lo: 0x1d49f, hi: 0x1d4a5, stride: 3 },
    { lo: 0x1d4a6, hi: 0x1d4a9, stride: 3 },
    { lo: 0x1d4aa, hi: 0x1d4ac, stride: 1 },
    { lo: 0x1d4ae, hi: 0x1d4b5, stride: 1 },
    { lo: 0x1d4d0, hi: 0x1d4e9, stride: 1 },
    { lo: 0x1d504, hi: 0x1d505, stride: 1 },
    { lo: 0x1d507, hi: 0x1d50a, stride: 1 },
    { lo: 0x1d50d, hi: 0x1d514, stride: 1 },
    { lo: 0x1d516, hi: 0x1d51c, stride: 1 },
    { lo: 0x1d538, hi: 0x1d539, stride: 1 },
    { lo: 0x1d53b, hi: 0x1d53e, stride: 1 },
    { lo: 0x1d540, hi: 0x1d544, stride: 1 },
    { lo: 0x1d546, hi: 0x1d54a, stride: 4 },
    { lo: 0x1d54b, hi: 0x1d550, stride: 1 },
    { lo: 0x1d56c, hi: 0x1d585, stride: 1 },
    { lo: 0x1d5a0, hi: 0x1d5b9, stride: 1 },
    { lo: 0x1d5d4, hi: 0x1d5ed, stride: 1 },
    { lo: 0x1d608, hi: 0x1d621, stride: 1 },
    { lo: 0x1d63c, hi: 0x1d655, stride: 1 },
    { lo: 0x1d670, hi: 0x1d689, stride: 1 },
    { lo: 0x1d6a8, hi: 0x1d6c0, stride: 1 },
    { lo: 0x1d6e2, hi: 0x1d6fa, stride: 1 },
    { lo: 0x1d71c, hi: 0x1d734, stride: 1 },
    { lo: 0x1d756, hi: 0x1d76e, stride: 1 },
    { lo: 0x1d790, hi: 0x1d7a8, stride: 1 },
    { lo: 0x1d7ca, hi: 0x1e900, stride: 4406 },
    { lo: 0x1e901, hi: 0x1e921, stride: 1 }
  ],
  latinOffset: 3
}

export const digit = _Nd // Digit is the set of Unicode characters with the "decimal digit" property.
export const upper = _Lu // Upper is the set of Unicode upper case letters.

const _ASCII_Hex_Digit = {
  r16: [
    { lo: 0x0030, hi: 0x0039, stride: 1 },
    { lo: 0x0041, hi: 0x0046, stride: 1 },
    { lo: 0x0061, hi: 0x0066, stride: 1 }
  ],
  latinOffset: 3
}

const _Bidi_Control = {
  r16: [
    { lo: 0x061c, hi: 0x200e, stride: 6642 },
    { lo: 0x200f, hi: 0x202a, stride: 27 },
    { lo: 0x202b, hi: 0x202e, stride: 1 },
    { lo: 0x2066, hi: 0x2069, stride: 1 }
  ]
}

const _Dash = {
  r16: [
    { lo: 0x002d, hi: 0x058a, stride: 1373 },
    { lo: 0x05be, hi: 0x1400, stride: 3650 },
    { lo: 0x1806, hi: 0x2010, stride: 2058 },
    { lo: 0x2011, hi: 0x2015, stride: 1 },
    { lo: 0x2053, hi: 0x207b, stride: 40 },
    { lo: 0x208b, hi: 0x2212, stride: 391 },
    { lo: 0x2e17, hi: 0x2e1a, stride: 3 },
    { lo: 0x2e3a, hi: 0x2e3b, stride: 1 },
    { lo: 0x2e40, hi: 0x301c, stride: 476 },
    { lo: 0x3030, hi: 0x30a0, stride: 112 },
    { lo: 0xfe31, hi: 0xfe32, stride: 1 },
    { lo: 0xfe58, hi: 0xfe63, stride: 11 },
    { lo: 0xff0d, hi: 0xff0d, stride: 1 }
  ]
}

const _Deprecated = {
  r16: [
    { lo: 0x0149, hi: 0x0673, stride: 1322 },
    { lo: 0x0f77, hi: 0x0f79, stride: 2 },
    { lo: 0x17a3, hi: 0x17a4, stride: 1 },
    { lo: 0x206a, hi: 0x206f, stride: 1 },
    { lo: 0x2329, hi: 0x232a, stride: 1 }
  ],
  r32: [{ lo: 0xe0001, hi: 0xe0001, stride: 1 }]
}

const _Diacritic = {
  r16: [
    { lo: 0x005e, hi: 0x0060, stride: 2 },
    { lo: 0x00a8, hi: 0x00af, stride: 7 },
    { lo: 0x00b4, hi: 0x00b7, stride: 3 },
    { lo: 0x00b8, hi: 0x02b0, stride: 504 },
    { lo: 0x02b1, hi: 0x034e, stride: 1 },
    { lo: 0x0350, hi: 0x0357, stride: 1 },
    { lo: 0x035d, hi: 0x0362, stride: 1 },
    { lo: 0x0374, hi: 0x0375, stride: 1 },
    { lo: 0x037a, hi: 0x0384, stride: 10 },
    { lo: 0x0385, hi: 0x0483, stride: 254 },
    { lo: 0x0484, hi: 0x0487, stride: 1 },
    { lo: 0x0559, hi: 0x0591, stride: 56 },
    { lo: 0x0592, hi: 0x05a1, stride: 1 },
    { lo: 0x05a3, hi: 0x05bd, stride: 1 },
    { lo: 0x05bf, hi: 0x05c1, stride: 2 },
    { lo: 0x05c2, hi: 0x05c4, stride: 2 },
    { lo: 0x064b, hi: 0x0652, stride: 1 },
    { lo: 0x0657, hi: 0x0658, stride: 1 },
    { lo: 0x06df, hi: 0x06e0, stride: 1 },
    { lo: 0x06e5, hi: 0x06e6, stride: 1 },
    { lo: 0x06ea, hi: 0x06ec, stride: 1 },
    { lo: 0x0730, hi: 0x074a, stride: 1 },
    { lo: 0x07a6, hi: 0x07b0, stride: 1 },
    { lo: 0x07eb, hi: 0x07f5, stride: 1 },
    { lo: 0x0818, hi: 0x0819, stride: 1 },
    { lo: 0x08e3, hi: 0x08fe, stride: 1 },
    { lo: 0x093c, hi: 0x094d, stride: 17 },
    { lo: 0x0951, hi: 0x0954, stride: 1 },
    { lo: 0x0971, hi: 0x09bc, stride: 75 },
    { lo: 0x09cd, hi: 0x0a3c, stride: 111 },
    { lo: 0x0a4d, hi: 0x0abc, stride: 111 },
    { lo: 0x0acd, hi: 0x0afd, stride: 48 },
    { lo: 0x0afe, hi: 0x0aff, stride: 1 },
    { lo: 0x0b3c, hi: 0x0b4d, stride: 17 },
    { lo: 0x0bcd, hi: 0x0c4d, stride: 128 },
    { lo: 0x0cbc, hi: 0x0ccd, stride: 17 },
    { lo: 0x0d3b, hi: 0x0d3c, stride: 1 },
    { lo: 0x0d4d, hi: 0x0e47, stride: 125 },
    { lo: 0x0e48, hi: 0x0e4c, stride: 1 },
    { lo: 0x0e4e, hi: 0x0eba, stride: 108 },
    { lo: 0x0ec8, hi: 0x0ecc, stride: 1 },
    { lo: 0x0f18, hi: 0x0f19, stride: 1 },
    { lo: 0x0f35, hi: 0x0f39, stride: 2 },
    { lo: 0x0f3e, hi: 0x0f3f, stride: 1 },
    { lo: 0x0f82, hi: 0x0f84, stride: 1 },
    { lo: 0x0f86, hi: 0x0f87, stride: 1 },
    { lo: 0x0fc6, hi: 0x1037, stride: 113 },
    { lo: 0x1039, hi: 0x103a, stride: 1 },
    { lo: 0x1063, hi: 0x1064, stride: 1 },
    { lo: 0x1069, hi: 0x106d, stride: 1 },
    { lo: 0x1087, hi: 0x108d, stride: 1 },
    { lo: 0x108f, hi: 0x109a, stride: 11 },
    { lo: 0x109b, hi: 0x135d, stride: 706 },
    { lo: 0x135e, hi: 0x135f, stride: 1 },
    { lo: 0x17c9, hi: 0x17d3, stride: 1 },
    { lo: 0x17dd, hi: 0x1939, stride: 348 },
    { lo: 0x193a, hi: 0x193b, stride: 1 },
    { lo: 0x1a75, hi: 0x1a7c, stride: 1 },
    { lo: 0x1a7f, hi: 0x1ab0, stride: 49 },
    { lo: 0x1ab1, hi: 0x1abd, stride: 1 },
    { lo: 0x1b34, hi: 0x1b44, stride: 16 },
    { lo: 0x1b6b, hi: 0x1b73, stride: 1 },
    { lo: 0x1baa, hi: 0x1bab, stride: 1 },
    { lo: 0x1c36, hi: 0x1c37, stride: 1 },
    { lo: 0x1c78, hi: 0x1c7d, stride: 1 },
    { lo: 0x1cd0, hi: 0x1ce8, stride: 1 },
    { lo: 0x1ced, hi: 0x1cf4, stride: 7 },
    { lo: 0x1cf7, hi: 0x1cf9, stride: 1 },
    { lo: 0x1d2c, hi: 0x1d6a, stride: 1 },
    { lo: 0x1dc4, hi: 0x1dcf, stride: 1 },
    { lo: 0x1df5, hi: 0x1df9, stride: 1 },
    { lo: 0x1dfd, hi: 0x1dff, stride: 1 },
    { lo: 0x1fbd, hi: 0x1fbf, stride: 2 },
    { lo: 0x1fc0, hi: 0x1fc1, stride: 1 },
    { lo: 0x1fcd, hi: 0x1fcf, stride: 1 },
    { lo: 0x1fdd, hi: 0x1fdf, stride: 1 },
    { lo: 0x1fed, hi: 0x1fef, stride: 1 },
    { lo: 0x1ffd, hi: 0x1ffe, stride: 1 },
    { lo: 0x2cef, hi: 0x2cf1, stride: 1 },
    { lo: 0x2e2f, hi: 0x302a, stride: 507 },
    { lo: 0x302b, hi: 0x302f, stride: 1 },
    { lo: 0x3099, hi: 0x309c, stride: 1 },
    { lo: 0x30fc, hi: 0xa66f, stride: 30067 },
    { lo: 0xa67c, hi: 0xa67d, stride: 1 },
    { lo: 0xa67f, hi: 0xa69c, stride: 29 },
    { lo: 0xa69d, hi: 0xa6f0, stride: 83 },
    { lo: 0xa6f1, hi: 0xa700, stride: 15 },
    { lo: 0xa701, hi: 0xa721, stride: 1 },
    { lo: 0xa788, hi: 0xa78a, stride: 1 },
    { lo: 0xa7f8, hi: 0xa7f9, stride: 1 },
    { lo: 0xa8c4, hi: 0xa8e0, stride: 28 },
    { lo: 0xa8e1, hi: 0xa8f1, stride: 1 },
    { lo: 0xa92b, hi: 0xa92e, stride: 1 },
    { lo: 0xa953, hi: 0xa9b3, stride: 96 },
    { lo: 0xa9c0, hi: 0xa9e5, stride: 37 },
    { lo: 0xaa7b, hi: 0xaa7d, stride: 1 },
    { lo: 0xaabf, hi: 0xaac2, stride: 1 },
    { lo: 0xaaf6, hi: 0xab5b, stride: 101 },
    { lo: 0xab5c, hi: 0xab5f, stride: 1 },
    { lo: 0xabec, hi: 0xabed, stride: 1 },
    { lo: 0xfb1e, hi: 0xfe20, stride: 770 },
    { lo: 0xfe21, hi: 0xfe2f, stride: 1 },
    { lo: 0xff3e, hi: 0xff40, stride: 2 },
    { lo: 0xff70, hi: 0xff9e, stride: 46 },
    { lo: 0xff9f, hi: 0xffe3, stride: 68 }
  ],
  r32: [
    { lo: 0x102e0, hi: 0x10ae5, stride: 2053 },
    { lo: 0x10ae6, hi: 0x10d22, stride: 572 },
    { lo: 0x10d23, hi: 0x10d27, stride: 1 },
    { lo: 0x10f46, hi: 0x10f50, stride: 1 },
    { lo: 0x110b9, hi: 0x110ba, stride: 1 },
    { lo: 0x11133, hi: 0x11134, stride: 1 },
    { lo: 0x11173, hi: 0x111c0, stride: 77 },
    { lo: 0x111ca, hi: 0x111cc, stride: 1 },
    { lo: 0x11235, hi: 0x11236, stride: 1 },
    { lo: 0x112e9, hi: 0x112ea, stride: 1 },
    { lo: 0x1133c, hi: 0x1134d, stride: 17 },
    { lo: 0x11366, hi: 0x1136c, stride: 1 },
    { lo: 0x11370, hi: 0x11374, stride: 1 },
    { lo: 0x11442, hi: 0x11446, stride: 4 },
    { lo: 0x114c2, hi: 0x114c3, stride: 1 },
    { lo: 0x115bf, hi: 0x115c0, stride: 1 },
    { lo: 0x1163f, hi: 0x116b6, stride: 119 },
    { lo: 0x116b7, hi: 0x1172b, stride: 116 },
    { lo: 0x11839, hi: 0x1183a, stride: 1 },
    { lo: 0x119e0, hi: 0x11a34, stride: 84 },
    { lo: 0x11a47, hi: 0x11a99, stride: 82 },
    { lo: 0x11c3f, hi: 0x11d42, stride: 259 },
    { lo: 0x11d44, hi: 0x11d45, stride: 1 },
    { lo: 0x11d97, hi: 0x16af0, stride: 19801 },
    { lo: 0x16af1, hi: 0x16af4, stride: 1 },
    { lo: 0x16b30, hi: 0x16b36, stride: 1 },
    { lo: 0x16f8f, hi: 0x16f9f, stride: 1 },
    { lo: 0x1d167, hi: 0x1d169, stride: 1 },
    { lo: 0x1d16d, hi: 0x1d172, stride: 1 },
    { lo: 0x1d17b, hi: 0x1d182, stride: 1 },
    { lo: 0x1d185, hi: 0x1d18b, stride: 1 },
    { lo: 0x1d1aa, hi: 0x1d1ad, stride: 1 },
    { lo: 0x1e130, hi: 0x1e136, stride: 1 },
    { lo: 0x1e2ec, hi: 0x1e2ef, stride: 1 },
    { lo: 0x1e8d0, hi: 0x1e8d6, stride: 1 },
    { lo: 0x1e944, hi: 0x1e946, stride: 1 },
    { lo: 0x1e948, hi: 0x1e94a, stride: 1 }
  ],
  latinOffset: 3
}

const _Extender = {
  r16: [
    { lo: 0x00b7, hi: 0x02d0, stride: 537 },
    { lo: 0x02d1, hi: 0x0640, stride: 879 },
    { lo: 0x07fa, hi: 0x0e46, stride: 1612 },
    { lo: 0x0ec6, hi: 0x180a, stride: 2372 },
    { lo: 0x1843, hi: 0x1aa7, stride: 612 },
    { lo: 0x1c36, hi: 0x1c7b, stride: 69 },
    { lo: 0x3005, hi: 0x3031, stride: 44 },
    { lo: 0x3032, hi: 0x3035, stride: 1 },
    { lo: 0x309d, hi: 0x309e, stride: 1 },
    { lo: 0x30fc, hi: 0x30fe, stride: 1 },
    { lo: 0xa015, hi: 0xa60c, stride: 1527 },
    { lo: 0xa9cf, hi: 0xa9e6, stride: 23 },
    { lo: 0xaa70, hi: 0xaadd, stride: 109 },
    { lo: 0xaaf3, hi: 0xaaf4, stride: 1 },
    { lo: 0xff70, hi: 0xff70, stride: 1 }
  ],
  r32: [
    { lo: 0x1135d, hi: 0x115c6, stride: 617 },
    { lo: 0x115c7, hi: 0x115c8, stride: 1 },
    { lo: 0x11a98, hi: 0x16b42, stride: 20650 },
    { lo: 0x16b43, hi: 0x16fe0, stride: 1181 },
    { lo: 0x16fe1, hi: 0x16fe3, stride: 2 },
    { lo: 0x1e13c, hi: 0x1e13d, stride: 1 },
    { lo: 0x1e944, hi: 0x1e946, stride: 1 }
  ]
}

const _Hex_Digit = {
  r16: [
    { lo: 0x0030, hi: 0x0039, stride: 1 },
    { lo: 0x0041, hi: 0x0046, stride: 1 },
    { lo: 0x0061, hi: 0x0066, stride: 1 },
    { lo: 0xff10, hi: 0xff19, stride: 1 },
    { lo: 0xff21, hi: 0xff26, stride: 1 },
    { lo: 0xff41, hi: 0xff46, stride: 1 }
  ],
  latinOffset: 3
}

const _Hyphen = {
  r16: [
    { lo: 0x002d, hi: 0x00ad, stride: 128 },
    { lo: 0x058a, hi: 0x1806, stride: 4732 },
    { lo: 0x2010, hi: 0x2011, stride: 1 },
    { lo: 0x2e17, hi: 0x30fb, stride: 740 },
    { lo: 0xfe63, hi: 0xff0d, stride: 170 },
    { lo: 0xff65, hi: 0xff65, stride: 1 }
  ],
  latinOffset: 1
}

const _IDS_Binary_Operator = {
  r16: [
    { lo: 0x2ff0, hi: 0x2ff1, stride: 1 },
    { lo: 0x2ff4, hi: 0x2ffb, stride: 1 }
  ]
}

const _IDS_Trinary_Operator = {
  r16: [{ lo: 0x2ff2, hi: 0x2ff3, stride: 1 }]
}

const _Ideographic = {
  r16: [
    { lo: 0x3006, hi: 0x3007, stride: 1 },
    { lo: 0x3021, hi: 0x3029, stride: 1 },
    { lo: 0x3038, hi: 0x303a, stride: 1 },
    { lo: 0x3400, hi: 0x4db5, stride: 1 },
    { lo: 0x4e00, hi: 0x9fef, stride: 1 },
    { lo: 0xf900, hi: 0xfa6d, stride: 1 },
    { lo: 0xfa70, hi: 0xfad9, stride: 1 }
  ],
  r32: [
    { lo: 0x17000, hi: 0x187f7, stride: 1 },
    { lo: 0x18800, hi: 0x18af2, stride: 1 },
    { lo: 0x1b170, hi: 0x1b2fb, stride: 1 },
    { lo: 0x20000, hi: 0x2a6d6, stride: 1 },
    { lo: 0x2a700, hi: 0x2b734, stride: 1 },
    { lo: 0x2b740, hi: 0x2b81d, stride: 1 },
    { lo: 0x2b820, hi: 0x2cea1, stride: 1 },
    { lo: 0x2ceb0, hi: 0x2ebe0, stride: 1 },
    { lo: 0x2f800, hi: 0x2fa1d, stride: 1 }
  ]
}

const _Join_Control = {
  r16: [{ lo: 0x200c, hi: 0x200d, stride: 1 }]
}

const _Logical_Order_Exception = {
  r16: [
    { lo: 0x0e40, hi: 0x0e44, stride: 1 },
    { lo: 0x0ec0, hi: 0x0ec4, stride: 1 },
    { lo: 0x19b5, hi: 0x19b7, stride: 1 },
    { lo: 0x19ba, hi: 0xaab5, stride: 37115 },
    { lo: 0xaab6, hi: 0xaab9, stride: 3 },
    { lo: 0xaabb, hi: 0xaabc, stride: 1 }
  ]
}

const _Noncharacter_Code_Point = {
  r16: [
    { lo: 0xfdd0, hi: 0xfdef, stride: 1 },
    { lo: 0xfffe, hi: 0xffff, stride: 1 }
  ],
  r32: [
    { lo: 0x1fffe, hi: 0x1ffff, stride: 1 },
    { lo: 0x2fffe, hi: 0x2ffff, stride: 1 },
    { lo: 0x3fffe, hi: 0x3ffff, stride: 1 },
    { lo: 0x4fffe, hi: 0x4ffff, stride: 1 },
    { lo: 0x5fffe, hi: 0x5ffff, stride: 1 },
    { lo: 0x6fffe, hi: 0x6ffff, stride: 1 },
    { lo: 0x7fffe, hi: 0x7ffff, stride: 1 },
    { lo: 0x8fffe, hi: 0x8ffff, stride: 1 },
    { lo: 0x9fffe, hi: 0x9ffff, stride: 1 },
    { lo: 0xafffe, hi: 0xaffff, stride: 1 },
    { lo: 0xbfffe, hi: 0xbffff, stride: 1 },
    { lo: 0xcfffe, hi: 0xcffff, stride: 1 },
    { lo: 0xdfffe, hi: 0xdffff, stride: 1 },
    { lo: 0xefffe, hi: 0xeffff, stride: 1 },
    { lo: 0xffffe, hi: 0xfffff, stride: 1 },
    { lo: 0x10fffe, hi: 0x10ffff, stride: 1 }
  ]
}

const _Other_Alphabetic = {
  r16: [
    { lo: 0x0345, hi: 0x05b0, stride: 619 },
    { lo: 0x05b1, hi: 0x05bd, stride: 1 },
    { lo: 0x05bf, hi: 0x05c1, stride: 2 },
    { lo: 0x05c2, hi: 0x05c4, stride: 2 },
    { lo: 0x05c5, hi: 0x05c7, stride: 2 },
    { lo: 0x0610, hi: 0x061a, stride: 1 },
    { lo: 0x064b, hi: 0x0657, stride: 1 },
    { lo: 0x0659, hi: 0x065f, stride: 1 },
    { lo: 0x0670, hi: 0x06d6, stride: 102 },
    { lo: 0x06d7, hi: 0x06dc, stride: 1 },
    { lo: 0x06e1, hi: 0x06e4, stride: 1 },
    { lo: 0x06e7, hi: 0x06e8, stride: 1 },
    { lo: 0x06ed, hi: 0x0711, stride: 36 },
    { lo: 0x0730, hi: 0x073f, stride: 1 },
    { lo: 0x07a6, hi: 0x07b0, stride: 1 },
    { lo: 0x0816, hi: 0x0817, stride: 1 },
    { lo: 0x081b, hi: 0x0823, stride: 1 },
    { lo: 0x0825, hi: 0x0827, stride: 1 },
    { lo: 0x0829, hi: 0x082c, stride: 1 },
    { lo: 0x08d4, hi: 0x08df, stride: 1 },
    { lo: 0x08e3, hi: 0x08e9, stride: 1 },
    { lo: 0x08f0, hi: 0x0903, stride: 1 },
    { lo: 0x093a, hi: 0x093b, stride: 1 },
    { lo: 0x093e, hi: 0x094c, stride: 1 },
    { lo: 0x094e, hi: 0x094f, stride: 1 },
    { lo: 0x0955, hi: 0x0957, stride: 1 },
    { lo: 0x0962, hi: 0x0963, stride: 1 },
    { lo: 0x0981, hi: 0x0983, stride: 1 },
    { lo: 0x09be, hi: 0x09c4, stride: 1 },
    { lo: 0x09c7, hi: 0x09c8, stride: 1 },
    { lo: 0x09cb, hi: 0x09cc, stride: 1 },
    { lo: 0x09d7, hi: 0x09e2, stride: 11 },
    { lo: 0x09e3, hi: 0x0a01, stride: 30 },
    { lo: 0x0a02, hi: 0x0a03, stride: 1 },
    { lo: 0x0a3e, hi: 0x0a42, stride: 1 },
    { lo: 0x0a47, hi: 0x0a48, stride: 1 },
    { lo: 0x0a4b, hi: 0x0a4c, stride: 1 },
    { lo: 0x0a51, hi: 0x0a70, stride: 31 },
    { lo: 0x0a71, hi: 0x0a75, stride: 4 },
    { lo: 0x0a81, hi: 0x0a83, stride: 1 },
    { lo: 0x0abe, hi: 0x0ac5, stride: 1 },
    { lo: 0x0ac7, hi: 0x0ac9, stride: 1 },
    { lo: 0x0acb, hi: 0x0acc, stride: 1 },
    { lo: 0x0ae2, hi: 0x0ae3, stride: 1 },
    { lo: 0x0afa, hi: 0x0afc, stride: 1 },
    { lo: 0x0b01, hi: 0x0b03, stride: 1 },
    { lo: 0x0b3e, hi: 0x0b44, stride: 1 },
    { lo: 0x0b47, hi: 0x0b48, stride: 1 },
    { lo: 0x0b4b, hi: 0x0b4c, stride: 1 },
    { lo: 0x0b56, hi: 0x0b57, stride: 1 },
    { lo: 0x0b62, hi: 0x0b63, stride: 1 },
    { lo: 0x0b82, hi: 0x0bbe, stride: 60 },
    { lo: 0x0bbf, hi: 0x0bc2, stride: 1 },
    { lo: 0x0bc6, hi: 0x0bc8, stride: 1 },
    { lo: 0x0bca, hi: 0x0bcc, stride: 1 },
    { lo: 0x0bd7, hi: 0x0c00, stride: 41 },
    { lo: 0x0c01, hi: 0x0c03, stride: 1 },
    { lo: 0x0c3e, hi: 0x0c44, stride: 1 },
    { lo: 0x0c46, hi: 0x0c48, stride: 1 },
    { lo: 0x0c4a, hi: 0x0c4c, stride: 1 },
    { lo: 0x0c55, hi: 0x0c56, stride: 1 },
    { lo: 0x0c62, hi: 0x0c63, stride: 1 },
    { lo: 0x0c81, hi: 0x0c83, stride: 1 },
    { lo: 0x0cbe, hi: 0x0cc4, stride: 1 },
    { lo: 0x0cc6, hi: 0x0cc8, stride: 1 },
    { lo: 0x0cca, hi: 0x0ccc, stride: 1 },
    { lo: 0x0cd5, hi: 0x0cd6, stride: 1 },
    { lo: 0x0ce2, hi: 0x0ce3, stride: 1 },
    { lo: 0x0d00, hi: 0x0d03, stride: 1 },
    { lo: 0x0d3e, hi: 0x0d44, stride: 1 },
    { lo: 0x0d46, hi: 0x0d48, stride: 1 },
    { lo: 0x0d4a, hi: 0x0d4c, stride: 1 },
    { lo: 0x0d57, hi: 0x0d62, stride: 11 },
    { lo: 0x0d63, hi: 0x0d82, stride: 31 },
    { lo: 0x0d83, hi: 0x0dcf, stride: 76 },
    { lo: 0x0dd0, hi: 0x0dd4, stride: 1 },
    { lo: 0x0dd6, hi: 0x0dd8, stride: 2 },
    { lo: 0x0dd9, hi: 0x0ddf, stride: 1 },
    { lo: 0x0df2, hi: 0x0df3, stride: 1 },
    { lo: 0x0e31, hi: 0x0e34, stride: 3 },
    { lo: 0x0e35, hi: 0x0e3a, stride: 1 },
    { lo: 0x0e4d, hi: 0x0eb1, stride: 100 },
    { lo: 0x0eb4, hi: 0x0eb9, stride: 1 },
    { lo: 0x0ebb, hi: 0x0ebc, stride: 1 },
    { lo: 0x0ecd, hi: 0x0f71, stride: 164 },
    { lo: 0x0f72, hi: 0x0f81, stride: 1 },
    { lo: 0x0f8d, hi: 0x0f97, stride: 1 },
    { lo: 0x0f99, hi: 0x0fbc, stride: 1 },
    { lo: 0x102b, hi: 0x1036, stride: 1 },
    { lo: 0x1038, hi: 0x103b, stride: 3 },
    { lo: 0x103c, hi: 0x103e, stride: 1 },
    { lo: 0x1056, hi: 0x1059, stride: 1 },
    { lo: 0x105e, hi: 0x1060, stride: 1 },
    { lo: 0x1062, hi: 0x1064, stride: 1 },
    { lo: 0x1067, hi: 0x106d, stride: 1 },
    { lo: 0x1071, hi: 0x1074, stride: 1 },
    { lo: 0x1082, hi: 0x108d, stride: 1 },
    { lo: 0x108f, hi: 0x109a, stride: 11 },
    { lo: 0x109b, hi: 0x109d, stride: 1 },
    { lo: 0x1712, hi: 0x1713, stride: 1 },
    { lo: 0x1732, hi: 0x1733, stride: 1 },
    { lo: 0x1752, hi: 0x1753, stride: 1 },
    { lo: 0x1772, hi: 0x1773, stride: 1 },
    { lo: 0x17b6, hi: 0x17c8, stride: 1 },
    { lo: 0x1885, hi: 0x1886, stride: 1 },
    { lo: 0x18a9, hi: 0x1920, stride: 119 },
    { lo: 0x1921, hi: 0x192b, stride: 1 },
    { lo: 0x1930, hi: 0x1938, stride: 1 },
    { lo: 0x1a17, hi: 0x1a1b, stride: 1 },
    { lo: 0x1a55, hi: 0x1a5e, stride: 1 },
    { lo: 0x1a61, hi: 0x1a74, stride: 1 },
    { lo: 0x1b00, hi: 0x1b04, stride: 1 },
    { lo: 0x1b35, hi: 0x1b43, stride: 1 },
    { lo: 0x1b80, hi: 0x1b82, stride: 1 },
    { lo: 0x1ba1, hi: 0x1ba9, stride: 1 },
    { lo: 0x1bac, hi: 0x1bad, stride: 1 },
    { lo: 0x1be7, hi: 0x1bf1, stride: 1 },
    { lo: 0x1c24, hi: 0x1c36, stride: 1 },
    { lo: 0x1de7, hi: 0x1df4, stride: 1 },
    { lo: 0x24b6, hi: 0x24e9, stride: 1 },
    { lo: 0x2de0, hi: 0x2dff, stride: 1 },
    { lo: 0xa674, hi: 0xa67b, stride: 1 },
    { lo: 0xa69e, hi: 0xa69f, stride: 1 },
    { lo: 0xa802, hi: 0xa80b, stride: 9 },
    { lo: 0xa823, hi: 0xa827, stride: 1 },
    { lo: 0xa880, hi: 0xa881, stride: 1 },
    { lo: 0xa8b4, hi: 0xa8c3, stride: 1 },
    { lo: 0xa8c5, hi: 0xa8ff, stride: 58 },
    { lo: 0xa926, hi: 0xa92a, stride: 1 },
    { lo: 0xa947, hi: 0xa952, stride: 1 },
    { lo: 0xa980, hi: 0xa983, stride: 1 },
    { lo: 0xa9b4, hi: 0xa9bf, stride: 1 },
    { lo: 0xa9e5, hi: 0xaa29, stride: 68 },
    { lo: 0xaa2a, hi: 0xaa36, stride: 1 },
    { lo: 0xaa43, hi: 0xaa4c, stride: 9 },
    { lo: 0xaa4d, hi: 0xaa7b, stride: 46 },
    { lo: 0xaa7c, hi: 0xaa7d, stride: 1 },
    { lo: 0xaab0, hi: 0xaab2, stride: 2 },
    { lo: 0xaab3, hi: 0xaab4, stride: 1 },
    { lo: 0xaab7, hi: 0xaab8, stride: 1 },
    { lo: 0xaabe, hi: 0xaaeb, stride: 45 },
    { lo: 0xaaec, hi: 0xaaef, stride: 1 },
    { lo: 0xaaf5, hi: 0xabe3, stride: 238 },
    { lo: 0xabe4, hi: 0xabea, stride: 1 },
    { lo: 0xfb1e, hi: 0xfb1e, stride: 1 }
  ],
  r32: [
    { lo: 0x10376, hi: 0x1037a, stride: 1 },
    { lo: 0x10a01, hi: 0x10a03, stride: 1 },
    { lo: 0x10a05, hi: 0x10a06, stride: 1 },
    { lo: 0x10a0c, hi: 0x10a0f, stride: 1 },
    { lo: 0x10d24, hi: 0x10d27, stride: 1 },
    { lo: 0x11000, hi: 0x11002, stride: 1 },
    { lo: 0x11038, hi: 0x11045, stride: 1 },
    { lo: 0x11082, hi: 0x110b0, stride: 46 },
    { lo: 0x110b1, hi: 0x110b8, stride: 1 },
    { lo: 0x11100, hi: 0x11102, stride: 1 },
    { lo: 0x11127, hi: 0x11132, stride: 1 },
    { lo: 0x11145, hi: 0x11146, stride: 1 },
    { lo: 0x11180, hi: 0x11182, stride: 1 },
    { lo: 0x111b3, hi: 0x111bf, stride: 1 },
    { lo: 0x1122c, hi: 0x11234, stride: 1 },
    { lo: 0x11237, hi: 0x1123e, stride: 7 },
    { lo: 0x112df, hi: 0x112e8, stride: 1 },
    { lo: 0x11300, hi: 0x11303, stride: 1 },
    { lo: 0x1133e, hi: 0x11344, stride: 1 },
    { lo: 0x11347, hi: 0x11348, stride: 1 },
    { lo: 0x1134b, hi: 0x1134c, stride: 1 },
    { lo: 0x11357, hi: 0x11362, stride: 11 },
    { lo: 0x11363, hi: 0x11435, stride: 210 },
    { lo: 0x11436, hi: 0x11441, stride: 1 },
    { lo: 0x11443, hi: 0x11445, stride: 1 },
    { lo: 0x114b0, hi: 0x114c1, stride: 1 },
    { lo: 0x115af, hi: 0x115b5, stride: 1 },
    { lo: 0x115b8, hi: 0x115be, stride: 1 },
    { lo: 0x115dc, hi: 0x115dd, stride: 1 },
    { lo: 0x11630, hi: 0x1163e, stride: 1 },
    { lo: 0x11640, hi: 0x116ab, stride: 107 },
    { lo: 0x116ac, hi: 0x116b5, stride: 1 },
    { lo: 0x1171d, hi: 0x1172a, stride: 1 },
    { lo: 0x1182c, hi: 0x11838, stride: 1 },
    { lo: 0x119d1, hi: 0x119d7, stride: 1 },
    { lo: 0x119da, hi: 0x119df, stride: 1 },
    { lo: 0x119e4, hi: 0x11a01, stride: 29 },
    { lo: 0x11a02, hi: 0x11a0a, stride: 1 },
    { lo: 0x11a35, hi: 0x11a39, stride: 1 },
    { lo: 0x11a3b, hi: 0x11a3e, stride: 1 },
    { lo: 0x11a51, hi: 0x11a5b, stride: 1 },
    { lo: 0x11a8a, hi: 0x11a97, stride: 1 },
    { lo: 0x11c2f, hi: 0x11c36, stride: 1 },
    { lo: 0x11c38, hi: 0x11c3e, stride: 1 },
    { lo: 0x11c92, hi: 0x11ca7, stride: 1 },
    { lo: 0x11ca9, hi: 0x11cb6, stride: 1 },
    { lo: 0x11d31, hi: 0x11d36, stride: 1 },
    { lo: 0x11d3a, hi: 0x11d3c, stride: 2 },
    { lo: 0x11d3d, hi: 0x11d3f, stride: 2 },
    { lo: 0x11d40, hi: 0x11d41, stride: 1 },
    { lo: 0x11d43, hi: 0x11d47, stride: 4 },
    { lo: 0x11d8a, hi: 0x11d8e, stride: 1 },
    { lo: 0x11d90, hi: 0x11d91, stride: 1 },
    { lo: 0x11d93, hi: 0x11d96, stride: 1 },
    { lo: 0x11ef3, hi: 0x11ef6, stride: 1 },
    { lo: 0x16f4f, hi: 0x16f51, stride: 2 },
    { lo: 0x16f52, hi: 0x16f87, stride: 1 },
    { lo: 0x16f8f, hi: 0x16f92, stride: 1 },
    { lo: 0x1bc9e, hi: 0x1e000, stride: 9058 },
    { lo: 0x1e001, hi: 0x1e006, stride: 1 },
    { lo: 0x1e008, hi: 0x1e018, stride: 1 },
    { lo: 0x1e01b, hi: 0x1e021, stride: 1 },
    { lo: 0x1e023, hi: 0x1e024, stride: 1 },
    { lo: 0x1e026, hi: 0x1e02a, stride: 1 },
    { lo: 0x1e947, hi: 0x1f130, stride: 2025 },
    { lo: 0x1f131, hi: 0x1f149, stride: 1 },
    { lo: 0x1f150, hi: 0x1f169, stride: 1 },
    { lo: 0x1f170, hi: 0x1f189, stride: 1 }
  ]
}

const _Other_Default_Ignorable_Code_Point = {
  r16: [
    { lo: 0x034f, hi: 0x115f, stride: 3600 },
    { lo: 0x1160, hi: 0x17b4, stride: 1620 },
    { lo: 0x17b5, hi: 0x2065, stride: 2224 },
    { lo: 0x3164, hi: 0xffa0, stride: 52796 },
    { lo: 0xfff0, hi: 0xfff8, stride: 1 }
  ],
  r32: [
    { lo: 0xe0000, hi: 0xe0002, stride: 2 },
    { lo: 0xe0003, hi: 0xe001f, stride: 1 },
    { lo: 0xe0080, hi: 0xe00ff, stride: 1 },
    { lo: 0xe01f0, hi: 0xe0fff, stride: 1 }
  ]
}

const _Other_Grapheme_Extend = {
  r16: [
    { lo: 0x09be, hi: 0x09d7, stride: 25 },
    { lo: 0x0b3e, hi: 0x0b57, stride: 25 },
    { lo: 0x0bbe, hi: 0x0bd7, stride: 25 },
    { lo: 0x0cc2, hi: 0x0cd5, stride: 19 },
    { lo: 0x0cd6, hi: 0x0d3e, stride: 104 },
    { lo: 0x0d57, hi: 0x0dcf, stride: 120 },
    { lo: 0x0ddf, hi: 0x1b35, stride: 3414 },
    { lo: 0x200c, hi: 0x302e, stride: 4130 },
    { lo: 0x302f, hi: 0xff9e, stride: 53103 },
    { lo: 0xff9f, hi: 0xff9f, stride: 1 }
  ],
  r32: [
    { lo: 0x1133e, hi: 0x11357, stride: 25 },
    { lo: 0x114b0, hi: 0x114bd, stride: 13 },
    { lo: 0x115af, hi: 0x1d165, stride: 48054 },
    { lo: 0x1d16e, hi: 0x1d172, stride: 1 },
    { lo: 0xe0020, hi: 0xe007f, stride: 1 }
  ]
}

const _Other_ID_Continue = {
  r16: [
    { lo: 0x00b7, hi: 0x0387, stride: 720 },
    { lo: 0x1369, hi: 0x1371, stride: 1 },
    { lo: 0x19da, hi: 0x19da, stride: 1 }
  ]
}

const _Other_ID_Start = {
  r16: [
    { lo: 0x1885, hi: 0x1886, stride: 1 },
    { lo: 0x2118, hi: 0x212e, stride: 22 },
    { lo: 0x309b, hi: 0x309c, stride: 1 }
  ]
}

const _Other_Lowercase = {
  r16: [
    { lo: 0x00aa, hi: 0x00ba, stride: 16 },
    { lo: 0x02b0, hi: 0x02b8, stride: 1 },
    { lo: 0x02c0, hi: 0x02c1, stride: 1 },
    { lo: 0x02e0, hi: 0x02e4, stride: 1 },
    { lo: 0x0345, hi: 0x037a, stride: 53 },
    { lo: 0x1d2c, hi: 0x1d6a, stride: 1 },
    { lo: 0x1d78, hi: 0x1d9b, stride: 35 },
    { lo: 0x1d9c, hi: 0x1dbf, stride: 1 },
    { lo: 0x2071, hi: 0x207f, stride: 14 },
    { lo: 0x2090, hi: 0x209c, stride: 1 },
    { lo: 0x2170, hi: 0x217f, stride: 1 },
    { lo: 0x24d0, hi: 0x24e9, stride: 1 },
    { lo: 0x2c7c, hi: 0x2c7d, stride: 1 },
    { lo: 0xa69c, hi: 0xa69d, stride: 1 },
    { lo: 0xa770, hi: 0xa7f8, stride: 136 },
    { lo: 0xa7f9, hi: 0xab5c, stride: 867 },
    { lo: 0xab5d, hi: 0xab5f, stride: 1 }
  ],
  latinOffset: 1
}

const _Other_Math = {
  r16: [
    { lo: 0x005e, hi: 0x03d0, stride: 882 },
    { lo: 0x03d1, hi: 0x03d2, stride: 1 },
    { lo: 0x03d5, hi: 0x03f0, stride: 27 },
    { lo: 0x03f1, hi: 0x03f4, stride: 3 },
    { lo: 0x03f5, hi: 0x2016, stride: 7201 },
    { lo: 0x2032, hi: 0x2034, stride: 1 },
    { lo: 0x2040, hi: 0x2061, stride: 33 },
    { lo: 0x2062, hi: 0x2064, stride: 1 },
    { lo: 0x207d, hi: 0x207e, stride: 1 },
    { lo: 0x208d, hi: 0x208e, stride: 1 },
    { lo: 0x20d0, hi: 0x20dc, stride: 1 },
    { lo: 0x20e1, hi: 0x20e5, stride: 4 },
    { lo: 0x20e6, hi: 0x20eb, stride: 5 },
    { lo: 0x20ec, hi: 0x20ef, stride: 1 },
    { lo: 0x2102, hi: 0x2107, stride: 5 },
    { lo: 0x210a, hi: 0x2113, stride: 1 },
    { lo: 0x2115, hi: 0x2119, stride: 4 },
    { lo: 0x211a, hi: 0x211d, stride: 1 },
    { lo: 0x2124, hi: 0x2128, stride: 4 },
    { lo: 0x2129, hi: 0x212c, stride: 3 },
    { lo: 0x212d, hi: 0x212f, stride: 2 },
    { lo: 0x2130, hi: 0x2131, stride: 1 },
    { lo: 0x2133, hi: 0x2138, stride: 1 },
    { lo: 0x213c, hi: 0x213f, stride: 1 },
    { lo: 0x2145, hi: 0x2149, stride: 1 },
    { lo: 0x2195, hi: 0x2199, stride: 1 },
    { lo: 0x219c, hi: 0x219f, stride: 1 },
    { lo: 0x21a1, hi: 0x21a2, stride: 1 },
    { lo: 0x21a4, hi: 0x21a5, stride: 1 },
    { lo: 0x21a7, hi: 0x21a9, stride: 2 },
    { lo: 0x21aa, hi: 0x21ad, stride: 1 },
    { lo: 0x21b0, hi: 0x21b1, stride: 1 },
    { lo: 0x21b6, hi: 0x21b7, stride: 1 },
    { lo: 0x21bc, hi: 0x21cd, stride: 1 },
    { lo: 0x21d0, hi: 0x21d1, stride: 1 },
    { lo: 0x21d3, hi: 0x21d5, stride: 2 },
    { lo: 0x21d6, hi: 0x21db, stride: 1 },
    { lo: 0x21dd, hi: 0x21e4, stride: 7 },
    { lo: 0x21e5, hi: 0x2308, stride: 291 },
    { lo: 0x2309, hi: 0x230b, stride: 1 },
    { lo: 0x23b4, hi: 0x23b5, stride: 1 },
    { lo: 0x23b7, hi: 0x23d0, stride: 25 },
    { lo: 0x23e2, hi: 0x25a0, stride: 446 },
    { lo: 0x25a1, hi: 0x25ae, stride: 13 },
    { lo: 0x25af, hi: 0x25b6, stride: 1 },
    { lo: 0x25bc, hi: 0x25c0, stride: 1 },
    { lo: 0x25c6, hi: 0x25c7, stride: 1 },
    { lo: 0x25ca, hi: 0x25cb, stride: 1 },
    { lo: 0x25cf, hi: 0x25d3, stride: 1 },
    { lo: 0x25e2, hi: 0x25e4, stride: 2 },
    { lo: 0x25e7, hi: 0x25ec, stride: 1 },
    { lo: 0x2605, hi: 0x2606, stride: 1 },
    { lo: 0x2640, hi: 0x2642, stride: 2 },
    { lo: 0x2660, hi: 0x2663, stride: 1 },
    { lo: 0x266d, hi: 0x266e, stride: 1 },
    { lo: 0x27c5, hi: 0x27c6, stride: 1 },
    { lo: 0x27e6, hi: 0x27ef, stride: 1 },
    { lo: 0x2983, hi: 0x2998, stride: 1 },
    { lo: 0x29d8, hi: 0x29db, stride: 1 },
    { lo: 0x29fc, hi: 0x29fd, stride: 1 },
    { lo: 0xfe61, hi: 0xfe63, stride: 2 },
    { lo: 0xfe68, hi: 0xff3c, stride: 212 },
    { lo: 0xff3e, hi: 0xff3e, stride: 1 }
  ],
  r32: [
    { lo: 0x1d400, hi: 0x1d454, stride: 1 },
    { lo: 0x1d456, hi: 0x1d49c, stride: 1 },
    { lo: 0x1d49e, hi: 0x1d49f, stride: 1 },
    { lo: 0x1d4a2, hi: 0x1d4a5, stride: 3 },
    { lo: 0x1d4a6, hi: 0x1d4a9, stride: 3 },
    { lo: 0x1d4aa, hi: 0x1d4ac, stride: 1 },
    { lo: 0x1d4ae, hi: 0x1d4b9, stride: 1 },
    { lo: 0x1d4bb, hi: 0x1d4bd, stride: 2 },
    { lo: 0x1d4be, hi: 0x1d4c3, stride: 1 },
    { lo: 0x1d4c5, hi: 0x1d505, stride: 1 },
    { lo: 0x1d507, hi: 0x1d50a, stride: 1 },
    { lo: 0x1d50d, hi: 0x1d514, stride: 1 },
    { lo: 0x1d516, hi: 0x1d51c, stride: 1 },
    { lo: 0x1d51e, hi: 0x1d539, stride: 1 },
    { lo: 0x1d53b, hi: 0x1d53e, stride: 1 },
    { lo: 0x1d540, hi: 0x1d544, stride: 1 },
    { lo: 0x1d546, hi: 0x1d54a, stride: 4 },
    { lo: 0x1d54b, hi: 0x1d550, stride: 1 },
    { lo: 0x1d552, hi: 0x1d6a5, stride: 1 },
    { lo: 0x1d6a8, hi: 0x1d6c0, stride: 1 },
    { lo: 0x1d6c2, hi: 0x1d6da, stride: 1 },
    { lo: 0x1d6dc, hi: 0x1d6fa, stride: 1 },
    { lo: 0x1d6fc, hi: 0x1d714, stride: 1 },
    { lo: 0x1d716, hi: 0x1d734, stride: 1 },
    { lo: 0x1d736, hi: 0x1d74e, stride: 1 },
    { lo: 0x1d750, hi: 0x1d76e, stride: 1 },
    { lo: 0x1d770, hi: 0x1d788, stride: 1 },
    { lo: 0x1d78a, hi: 0x1d7a8, stride: 1 },
    { lo: 0x1d7aa, hi: 0x1d7c2, stride: 1 },
    { lo: 0x1d7c4, hi: 0x1d7cb, stride: 1 },
    { lo: 0x1d7ce, hi: 0x1d7ff, stride: 1 },
    { lo: 0x1ee00, hi: 0x1ee03, stride: 1 },
    { lo: 0x1ee05, hi: 0x1ee1f, stride: 1 },
    { lo: 0x1ee21, hi: 0x1ee22, stride: 1 },
    { lo: 0x1ee24, hi: 0x1ee27, stride: 3 },
    { lo: 0x1ee29, hi: 0x1ee32, stride: 1 },
    { lo: 0x1ee34, hi: 0x1ee37, stride: 1 },
    { lo: 0x1ee39, hi: 0x1ee3b, stride: 2 },
    { lo: 0x1ee42, hi: 0x1ee47, stride: 5 },
    { lo: 0x1ee49, hi: 0x1ee4d, stride: 2 },
    { lo: 0x1ee4e, hi: 0x1ee4f, stride: 1 },
    { lo: 0x1ee51, hi: 0x1ee52, stride: 1 },
    { lo: 0x1ee54, hi: 0x1ee57, stride: 3 },
    { lo: 0x1ee59, hi: 0x1ee61, stride: 2 },
    { lo: 0x1ee62, hi: 0x1ee64, stride: 2 },
    { lo: 0x1ee67, hi: 0x1ee6a, stride: 1 },
    { lo: 0x1ee6c, hi: 0x1ee72, stride: 1 },
    { lo: 0x1ee74, hi: 0x1ee77, stride: 1 },
    { lo: 0x1ee79, hi: 0x1ee7c, stride: 1 },
    { lo: 0x1ee7e, hi: 0x1ee80, stride: 2 },
    { lo: 0x1ee81, hi: 0x1ee89, stride: 1 },
    { lo: 0x1ee8b, hi: 0x1ee9b, stride: 1 },
    { lo: 0x1eea1, hi: 0x1eea3, stride: 1 },
    { lo: 0x1eea5, hi: 0x1eea9, stride: 1 },
    { lo: 0x1eeab, hi: 0x1eebb, stride: 1 }
  ]
}

const _Other_Uppercase = {
  r16: [
    { lo: 0x2160, hi: 0x216f, stride: 1 },
    { lo: 0x24b6, hi: 0x24cf, stride: 1 }
  ],
  r32: [
    { lo: 0x1f130, hi: 0x1f149, stride: 1 },
    { lo: 0x1f150, hi: 0x1f169, stride: 1 },
    { lo: 0x1f170, hi: 0x1f189, stride: 1 }
  ]
}

const _Pattern_Syntax = {
  r16: [
    { lo: 0x0021, hi: 0x002f, stride: 1 },
    { lo: 0x003a, hi: 0x0040, stride: 1 },
    { lo: 0x005b, hi: 0x005e, stride: 1 },
    { lo: 0x0060, hi: 0x007b, stride: 27 },
    { lo: 0x007c, hi: 0x007e, stride: 1 },
    { lo: 0x00a1, hi: 0x00a7, stride: 1 },
    { lo: 0x00a9, hi: 0x00ab, stride: 2 },
    { lo: 0x00ac, hi: 0x00b0, stride: 2 },
    { lo: 0x00b1, hi: 0x00bb, stride: 5 },
    { lo: 0x00bf, hi: 0x00d7, stride: 24 },
    { lo: 0x00f7, hi: 0x2010, stride: 7961 },
    { lo: 0x2011, hi: 0x2027, stride: 1 },
    { lo: 0x2030, hi: 0x203e, stride: 1 },
    { lo: 0x2041, hi: 0x2053, stride: 1 },
    { lo: 0x2055, hi: 0x205e, stride: 1 },
    { lo: 0x2190, hi: 0x245f, stride: 1 },
    { lo: 0x2500, hi: 0x2775, stride: 1 },
    { lo: 0x2794, hi: 0x2bff, stride: 1 },
    { lo: 0x2e00, hi: 0x2e7f, stride: 1 },
    { lo: 0x3001, hi: 0x3003, stride: 1 },
    { lo: 0x3008, hi: 0x3020, stride: 1 },
    { lo: 0x3030, hi: 0xfd3e, stride: 52494 },
    { lo: 0xfd3f, hi: 0xfe45, stride: 262 },
    { lo: 0xfe46, hi: 0xfe46, stride: 1 }
  ],
  latinOffset: 10
}

const _Pattern_White_Space = {
  r16: [
    { lo: 0x0009, hi: 0x000d, stride: 1 },
    { lo: 0x0020, hi: 0x0085, stride: 101 },
    { lo: 0x200e, hi: 0x200f, stride: 1 },
    { lo: 0x2028, hi: 0x2029, stride: 1 }
  ],
  latinOffset: 2
}

const _Prepended_Concatenation_Mark = {
  r16: [
    { lo: 0x0600, hi: 0x0605, stride: 1 },
    { lo: 0x06dd, hi: 0x070f, stride: 50 },
    { lo: 0x08e2, hi: 0x08e2, stride: 1 }
  ],
  r32: [{ lo: 0x110bd, hi: 0x110cd, stride: 16 }]
}

const _Quotation_Mark = {
  r16: [
    { lo: 0x0022, hi: 0x0027, stride: 5 },
    { lo: 0x00ab, hi: 0x00bb, stride: 16 },
    { lo: 0x2018, hi: 0x201f, stride: 1 },
    { lo: 0x2039, hi: 0x203a, stride: 1 },
    { lo: 0x2e42, hi: 0x300c, stride: 458 },
    { lo: 0x300d, hi: 0x300f, stride: 1 },
    { lo: 0x301d, hi: 0x301f, stride: 1 },
    { lo: 0xfe41, hi: 0xfe44, stride: 1 },
    { lo: 0xff02, hi: 0xff07, stride: 5 },
    { lo: 0xff62, hi: 0xff63, stride: 1 }
  ],
  latinOffset: 2
}

const _Radical = {
  r16: [
    { lo: 0x2e80, hi: 0x2e99, stride: 1 },
    { lo: 0x2e9b, hi: 0x2ef3, stride: 1 },
    { lo: 0x2f00, hi: 0x2fd5, stride: 1 }
  ]
}

const _Regional_Indicator = {
  r16: [],
  r32: [{ lo: 0x1f1e6, hi: 0x1f1ff, stride: 1 }]
}

const _Sentence_Terminal = {
  r16: [
    { lo: 0x0021, hi: 0x002e, stride: 13 },
    { lo: 0x003f, hi: 0x0589, stride: 1354 },
    { lo: 0x061e, hi: 0x061f, stride: 1 },
    { lo: 0x06d4, hi: 0x0700, stride: 44 },
    { lo: 0x0701, hi: 0x0702, stride: 1 },
    { lo: 0x07f9, hi: 0x0837, stride: 62 },
    { lo: 0x0839, hi: 0x083d, stride: 4 },
    { lo: 0x083e, hi: 0x0964, stride: 294 },
    { lo: 0x0965, hi: 0x104a, stride: 1765 },
    { lo: 0x104b, hi: 0x1362, stride: 791 },
    { lo: 0x1367, hi: 0x1368, stride: 1 },
    { lo: 0x166e, hi: 0x1735, stride: 199 },
    { lo: 0x1736, hi: 0x1803, stride: 205 },
    { lo: 0x1809, hi: 0x1944, stride: 315 },
    { lo: 0x1945, hi: 0x1aa8, stride: 355 },
    { lo: 0x1aa9, hi: 0x1aab, stride: 1 },
    { lo: 0x1b5a, hi: 0x1b5b, stride: 1 },
    { lo: 0x1b5e, hi: 0x1b5f, stride: 1 },
    { lo: 0x1c3b, hi: 0x1c3c, stride: 1 },
    { lo: 0x1c7e, hi: 0x1c7f, stride: 1 },
    { lo: 0x203c, hi: 0x203d, stride: 1 },
    { lo: 0x2047, hi: 0x2049, stride: 1 },
    { lo: 0x2e2e, hi: 0x2e3c, stride: 14 },
    { lo: 0x3002, hi: 0xa4ff, stride: 29949 },
    { lo: 0xa60e, hi: 0xa60f, stride: 1 },
    { lo: 0xa6f3, hi: 0xa6f7, stride: 4 },
    { lo: 0xa876, hi: 0xa877, stride: 1 },
    { lo: 0xa8ce, hi: 0xa8cf, stride: 1 },
    { lo: 0xa92f, hi: 0xa9c8, stride: 153 },
    { lo: 0xa9c9, hi: 0xaa5d, stride: 148 },
    { lo: 0xaa5e, hi: 0xaa5f, stride: 1 },
    { lo: 0xaaf0, hi: 0xaaf1, stride: 1 },
    { lo: 0xabeb, hi: 0xfe52, stride: 21095 },
    { lo: 0xfe56, hi: 0xfe57, stride: 1 },
    { lo: 0xff01, hi: 0xff0e, stride: 13 },
    { lo: 0xff1f, hi: 0xff61, stride: 66 }
  ],
  r32: [
    { lo: 0x10a56, hi: 0x10a57, stride: 1 },
    { lo: 0x10f55, hi: 0x10f59, stride: 1 },
    { lo: 0x11047, hi: 0x11048, stride: 1 },
    { lo: 0x110be, hi: 0x110c1, stride: 1 },
    { lo: 0x11141, hi: 0x11143, stride: 1 },
    { lo: 0x111c5, hi: 0x111c6, stride: 1 },
    { lo: 0x111cd, hi: 0x111de, stride: 17 },
    { lo: 0x111df, hi: 0x11238, stride: 89 },
    { lo: 0x11239, hi: 0x1123b, stride: 2 },
    { lo: 0x1123c, hi: 0x112a9, stride: 109 },
    { lo: 0x1144b, hi: 0x1144c, stride: 1 },
    { lo: 0x115c2, hi: 0x115c3, stride: 1 },
    { lo: 0x115c9, hi: 0x115d7, stride: 1 },
    { lo: 0x11641, hi: 0x11642, stride: 1 },
    { lo: 0x1173c, hi: 0x1173e, stride: 1 },
    { lo: 0x11a42, hi: 0x11a43, stride: 1 },
    { lo: 0x11a9b, hi: 0x11a9c, stride: 1 },
    { lo: 0x11c41, hi: 0x11c42, stride: 1 },
    { lo: 0x11ef7, hi: 0x11ef8, stride: 1 },
    { lo: 0x16a6e, hi: 0x16a6f, stride: 1 },
    { lo: 0x16af5, hi: 0x16b37, stride: 66 },
    { lo: 0x16b38, hi: 0x16b44, stride: 12 },
    { lo: 0x16e98, hi: 0x1bc9f, stride: 19975 },
    { lo: 0x1da88, hi: 0x1da88, stride: 1 }
  ],
  latinOffset: 1
}

const _Soft_Dotted = {
  r16: [
    { lo: 0x0069, hi: 0x006a, stride: 1 },
    { lo: 0x012f, hi: 0x0249, stride: 282 },
    { lo: 0x0268, hi: 0x029d, stride: 53 },
    { lo: 0x02b2, hi: 0x03f3, stride: 321 },
    { lo: 0x0456, hi: 0x0458, stride: 2 },
    { lo: 0x1d62, hi: 0x1d96, stride: 52 },
    { lo: 0x1da4, hi: 0x1da8, stride: 4 },
    { lo: 0x1e2d, hi: 0x1ecb, stride: 158 },
    { lo: 0x2071, hi: 0x2148, stride: 215 },
    { lo: 0x2149, hi: 0x2c7c, stride: 2867 }
  ],
  r32: [
    { lo: 0x1d422, hi: 0x1d423, stride: 1 },
    { lo: 0x1d456, hi: 0x1d457, stride: 1 },
    { lo: 0x1d48a, hi: 0x1d48b, stride: 1 },
    { lo: 0x1d4be, hi: 0x1d4bf, stride: 1 },
    { lo: 0x1d4f2, hi: 0x1d4f3, stride: 1 },
    { lo: 0x1d526, hi: 0x1d527, stride: 1 },
    { lo: 0x1d55a, hi: 0x1d55b, stride: 1 },
    { lo: 0x1d58e, hi: 0x1d58f, stride: 1 },
    { lo: 0x1d5c2, hi: 0x1d5c3, stride: 1 },
    { lo: 0x1d5f6, hi: 0x1d5f7, stride: 1 },
    { lo: 0x1d62a, hi: 0x1d62b, stride: 1 },
    { lo: 0x1d65e, hi: 0x1d65f, stride: 1 },
    { lo: 0x1d692, hi: 0x1d693, stride: 1 }
  ],
  latinOffset: 1
}

const _Terminal_Punctuation = {
  r16: [
    { lo: 0x0021, hi: 0x002c, stride: 11 },
    { lo: 0x002e, hi: 0x003a, stride: 12 },
    { lo: 0x003b, hi: 0x003f, stride: 4 },
    { lo: 0x037e, hi: 0x0387, stride: 9 },
    { lo: 0x0589, hi: 0x05c3, stride: 58 },
    { lo: 0x060c, hi: 0x061b, stride: 15 },
    { lo: 0x061e, hi: 0x061f, stride: 1 },
    { lo: 0x06d4, hi: 0x0700, stride: 44 },
    { lo: 0x0701, hi: 0x070a, stride: 1 },
    { lo: 0x070c, hi: 0x07f8, stride: 236 },
    { lo: 0x07f9, hi: 0x0830, stride: 55 },
    { lo: 0x0831, hi: 0x083e, stride: 1 },
    { lo: 0x085e, hi: 0x0964, stride: 262 },
    { lo: 0x0965, hi: 0x0e5a, stride: 1269 },
    { lo: 0x0e5b, hi: 0x0f08, stride: 173 },
    { lo: 0x0f0d, hi: 0x0f12, stride: 1 },
    { lo: 0x104a, hi: 0x104b, stride: 1 },
    { lo: 0x1361, hi: 0x1368, stride: 1 },
    { lo: 0x166e, hi: 0x16eb, stride: 125 },
    { lo: 0x16ec, hi: 0x16ed, stride: 1 },
    { lo: 0x1735, hi: 0x1736, stride: 1 },
    { lo: 0x17d4, hi: 0x17d6, stride: 1 },
    { lo: 0x17da, hi: 0x1802, stride: 40 },
    { lo: 0x1803, hi: 0x1805, stride: 1 },
    { lo: 0x1808, hi: 0x1809, stride: 1 },
    { lo: 0x1944, hi: 0x1945, stride: 1 },
    { lo: 0x1aa8, hi: 0x1aab, stride: 1 },
    { lo: 0x1b5a, hi: 0x1b5b, stride: 1 },
    { lo: 0x1b5d, hi: 0x1b5f, stride: 1 },
    { lo: 0x1c3b, hi: 0x1c3f, stride: 1 },
    { lo: 0x1c7e, hi: 0x1c7f, stride: 1 },
    { lo: 0x203c, hi: 0x203d, stride: 1 },
    { lo: 0x2047, hi: 0x2049, stride: 1 },
    { lo: 0x2e2e, hi: 0x2e3c, stride: 14 },
    { lo: 0x2e41, hi: 0x2e4c, stride: 11 },
    { lo: 0x2e4e, hi: 0x2e4f, stride: 1 },
    { lo: 0x3001, hi: 0x3002, stride: 1 },
    { lo: 0xa4fe, hi: 0xa4ff, stride: 1 },
    { lo: 0xa60d, hi: 0xa60f, stride: 1 },
    { lo: 0xa6f3, hi: 0xa6f7, stride: 1 },
    { lo: 0xa876, hi: 0xa877, stride: 1 },
    { lo: 0xa8ce, hi: 0xa8cf, stride: 1 },
    { lo: 0xa92f, hi: 0xa9c7, stride: 152 },
    { lo: 0xa9c8, hi: 0xa9c9, stride: 1 },
    { lo: 0xaa5d, hi: 0xaa5f, stride: 1 },
    { lo: 0xaadf, hi: 0xaaf0, stride: 17 },
    { lo: 0xaaf1, hi: 0xabeb, stride: 250 },
    { lo: 0xfe50, hi: 0xfe52, stride: 1 },
    { lo: 0xfe54, hi: 0xfe57, stride: 1 },
    { lo: 0xff01, hi: 0xff0c, stride: 11 },
    { lo: 0xff0e, hi: 0xff1a, stride: 12 },
    { lo: 0xff1b, hi: 0xff1f, stride: 4 },
    { lo: 0xff61, hi: 0xff64, stride: 3 }
  ],
  r32: [
    { lo: 0x1039f, hi: 0x103d0, stride: 49 },
    { lo: 0x10857, hi: 0x1091f, stride: 200 },
    { lo: 0x10a56, hi: 0x10a57, stride: 1 },
    { lo: 0x10af0, hi: 0x10af5, stride: 1 },
    { lo: 0x10b3a, hi: 0x10b3f, stride: 1 },
    { lo: 0x10b99, hi: 0x10b9c, stride: 1 },
    { lo: 0x10f55, hi: 0x10f59, stride: 1 },
    { lo: 0x11047, hi: 0x1104d, stride: 1 },
    { lo: 0x110be, hi: 0x110c1, stride: 1 },
    { lo: 0x11141, hi: 0x11143, stride: 1 },
    { lo: 0x111c5, hi: 0x111c6, stride: 1 },
    { lo: 0x111cd, hi: 0x111de, stride: 17 },
    { lo: 0x111df, hi: 0x11238, stride: 89 },
    { lo: 0x11239, hi: 0x1123c, stride: 1 },
    { lo: 0x112a9, hi: 0x1144b, stride: 418 },
    { lo: 0x1144c, hi: 0x1144d, stride: 1 },
    { lo: 0x1145b, hi: 0x115c2, stride: 359 },
    { lo: 0x115c3, hi: 0x115c5, stride: 1 },
    { lo: 0x115c9, hi: 0x115d7, stride: 1 },
    { lo: 0x11641, hi: 0x11642, stride: 1 },
    { lo: 0x1173c, hi: 0x1173e, stride: 1 },
    { lo: 0x11a42, hi: 0x11a43, stride: 1 },
    { lo: 0x11a9b, hi: 0x11a9c, stride: 1 },
    { lo: 0x11aa1, hi: 0x11aa2, stride: 1 },
    { lo: 0x11c41, hi: 0x11c43, stride: 1 },
    { lo: 0x11c71, hi: 0x11ef7, stride: 646 },
    { lo: 0x11ef8, hi: 0x12470, stride: 1400 },
    { lo: 0x12471, hi: 0x12474, stride: 1 },
    { lo: 0x16a6e, hi: 0x16a6f, stride: 1 },
    { lo: 0x16af5, hi: 0x16b37, stride: 66 },
    { lo: 0x16b38, hi: 0x16b39, stride: 1 },
    { lo: 0x16b44, hi: 0x16e97, stride: 851 },
    { lo: 0x16e98, hi: 0x1bc9f, stride: 19975 },
    { lo: 0x1da87, hi: 0x1da8a, stride: 1 }
  ],
  latinOffset: 3
}

const _Unified_Ideograph = {
  r16: [
    { lo: 0x3400, hi: 0x4db5, stride: 1 },
    { lo: 0x4e00, hi: 0x9fef, stride: 1 },
    { lo: 0xfa0e, hi: 0xfa0f, stride: 1 },
    { lo: 0xfa11, hi: 0xfa13, stride: 2 },
    { lo: 0xfa14, hi: 0xfa1f, stride: 11 },
    { lo: 0xfa21, hi: 0xfa23, stride: 2 },
    { lo: 0xfa24, hi: 0xfa27, stride: 3 },
    { lo: 0xfa28, hi: 0xfa29, stride: 1 }
  ],
  r32: [
    { lo: 0x20000, hi: 0x2a6d6, stride: 1 },
    { lo: 0x2a700, hi: 0x2b734, stride: 1 },
    { lo: 0x2b740, hi: 0x2b81d, stride: 1 },
    { lo: 0x2b820, hi: 0x2cea1, stride: 1 },
    { lo: 0x2ceb0, hi: 0x2ebe0, stride: 1 }
  ]
}

const _Variation_Selector = {
  r16: [
    { lo: 0x180b, hi: 0x180d, stride: 1 },
    { lo: 0xfe00, hi: 0xfe0f, stride: 1 }
  ],
  r32: [{ lo: 0xe0100, hi: 0xe01ef, stride: 1 }]
}

const _White_Space = {
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

// These variables have type *RangeTable.
export const ASCII_Hex_Digit = _ASCII_Hex_Digit // ASCII_Hex_Digit is the set of Unicode characters with property ASCII_Hex_Digit.
export const Bidi_Control = _Bidi_Control // Bidi_Control is the set of Unicode characters with property Bidi_Control.
export const Dash = _Dash // Dash is the set of Unicode characters with property Dash.
export const Deprecated = _Deprecated // Deprecated is the set of Unicode characters with property Deprecated.
export const Diacritic = _Diacritic // Diacritic is the set of Unicode characters with property Diacritic.
export const Extender = _Extender // Extender is the set of Unicode characters with property Extender.
export const Hex_Digit = _Hex_Digit // Hex_Digit is the set of Unicode characters with property Hex_Digit.
export const Hyphen = _Hyphen // Hyphen is the set of Unicode characters with property Hyphen.
export const IDS_Binary_Operator = _IDS_Binary_Operator // IDS_Binary_Operator is the set of Unicode characters with property IDS_Binary_Operator.
export const IDS_Trinary_Operator = _IDS_Trinary_Operator // IDS_Trinary_Operator is the set of Unicode characters with property IDS_Trinary_Operator.
export const Ideographic = _Ideographic // Ideographic is the set of Unicode characters with property Ideographic.
export const Join_Control = _Join_Control // Join_Control is the set of Unicode characters with property Join_Control.
export const Logical_Order_Exception = _Logical_Order_Exception // Logical_Order_Exception is the set of Unicode characters with property Logical_Order_Exception.
export const Noncharacter_Code_Point = _Noncharacter_Code_Point // Noncharacter_Code_Point is the set of Unicode characters with property Noncharacter_Code_Point.
export const Other_Alphabetic = _Other_Alphabetic // Other_Alphabetic is the set of Unicode characters with property Other_Alphabetic.
export const Other_Default_Ignorable_Code_Point = _Other_Default_Ignorable_Code_Point // Other_Default_Ignorable_Code_Point is the set of Unicode characters with property Other_Default_Ignorable_Code_Point.
export const Other_Grapheme_Extend = _Other_Grapheme_Extend // Other_Grapheme_Extend is the set of Unicode characters with property Other_Grapheme_Extend.
export const Other_ID_Continue = _Other_ID_Continue // Other_ID_Continue is the set of Unicode characters with property Other_ID_Continue.
export const Other_ID_Start = _Other_ID_Start // Other_ID_Start is the set of Unicode characters with property Other_ID_Start.
export const Other_Lowercase = _Other_Lowercase // Other_Lowercase is the set of Unicode characters with property Other_Lowercase.
export const Other_Math = _Other_Math // Other_Math is the set of Unicode characters with property Other_Math.
export const Other_Uppercase = _Other_Uppercase // Other_Uppercase is the set of Unicode characters with property Other_Uppercase.
export const Pattern_Syntax = _Pattern_Syntax // Pattern_Syntax is the set of Unicode characters with property Pattern_Syntax.
export const Pattern_White_Space = _Pattern_White_Space // Pattern_White_Space is the set of Unicode characters with property Pattern_White_Space.
export const Prepended_Concatenation_Mark = _Prepended_Concatenation_Mark // Prepended_Concatenation_Mark is the set of Unicode characters with property Prepended_Concatenation_Mark.
export const Quotation_Mark = _Quotation_Mark // Quotation_Mark is the set of Unicode characters with property Quotation_Mark.
export const Radical = _Radical // Radical is the set of Unicode characters with property Radical.
export const Regional_Indicator = _Regional_Indicator // Regional_Indicator is the set of Unicode characters with property Regional_Indicator.
export const STerm = _Sentence_Terminal // STerm is an alias for Sentence_Terminal.
export const Sentence_Terminal = _Sentence_Terminal // Sentence_Terminal is the set of Unicode characters with property Sentence_Terminal.
export const Soft_Dotted = _Soft_Dotted // Soft_Dotted is the set of Unicode characters with property Soft_Dotted.
export const Terminal_Punctuation = _Terminal_Punctuation // Terminal_Punctuation is the set of Unicode characters with property Terminal_Punctuation.
export const Unified_Ideograph = _Unified_Ideograph // Unified_Ideograph is the set of Unicode characters with property Unified_Ideograph.
export const Variation_Selector = _Variation_Selector // Variation_Selector is the set of Unicode characters with property Variation_Selector.
export const White_Space = _White_Space // White_Space is the set of Unicode characters with property White_Space.

// Properties is the set of Unicode property tables.
export const properties = {
  ASCII_Hex_Digit: ASCII_Hex_Digit,
  Bidi_Control: Bidi_Control,
  Dash: Dash,
  Deprecated: Deprecated,
  Diacritic: Diacritic,
  Extender: Extender,
  Hex_Digit: Hex_Digit,
  Hyphen: Hyphen,
  IDS_Binary_Operator: IDS_Binary_Operator,
  IDS_Trinary_Operator: IDS_Trinary_Operator,
  Ideographic: Ideographic,
  Join_Control: Join_Control,
  Logical_Order_Exception: Logical_Order_Exception,
  Noncharacter_Code_Point: Noncharacter_Code_Point,
  Other_Alphabetic: Other_Alphabetic,
  Other_Default_Ignorable_Code_Point: Other_Default_Ignorable_Code_Point,
  Other_Grapheme_Extend: Other_Grapheme_Extend,
  Other_ID_Continue: Other_ID_Continue,
  Other_ID_Start: Other_ID_Start,
  Other_Lowercase: Other_Lowercase,
  Other_Math: Other_Math,
  Other_Uppercase: Other_Uppercase,
  Pattern_Syntax: Pattern_Syntax,
  Pattern_White_Space: Pattern_White_Space,
  Prepended_Concatenation_Mark: Prepended_Concatenation_Mark,
  Quotation_Mark: Quotation_Mark,
  Radical: Radical,
  Regional_Indicator: Regional_Indicator,
  Sentence_Terminal: Sentence_Terminal,
  STerm: Sentence_Terminal,
  Soft_Dotted: Soft_Dotted,
  Terminal_Punctuation: Terminal_Punctuation,
  Unified_Ideograph: Unified_Ideograph,
  Variation_Selector: Variation_Selector,
  White_Space: White_Space
}

const pC = 1 << 0 // a control character.
const pP = 1 << 1 // a punctuation character.
const pN = 1 << 2 // a numeral.
const pS = 1 << 3 // a symbolic character.
const pZ = 1 << 4 // a spacing character.
const pLu = 1 << 5 // an upper-case letter.
const pLl = 1 << 6 // a lower-case letter.
const pp = 1 << 7 // a printable character according to Go's definition.
const pg = pp | pZ // a graphical character according to the Unicode definition.
const pLo = pLl | pLu // a letter that is neither upper nor lower case.
const pLmask = pLo

const _properties: {
  [key: number]: number
} = {
  0x00: pC, // '\x00'
  0x01: pC, // '\x01'
  0x02: pC, // '\x02'
  0x03: pC, // '\x03'
  0x04: pC, // '\x04'
  0x05: pC, // '\x05'
  0x06: pC, // '\x06'
  0x07: pC, // '\a'
  0x08: pC, // '\b'
  0x09: pC, // '\t'
  0x0a: pC, // '\n'
  0x0b: pC, // '\v'
  0x0c: pC, // '\f'
  0x0d: pC, // '\r'
  0x0e: pC, // '\x0e'
  0x0f: pC, // '\x0f'
  0x10: pC, // '\x10'
  0x11: pC, // '\x11'
  0x12: pC, // '\x12'
  0x13: pC, // '\x13'
  0x14: pC, // '\x14'
  0x15: pC, // '\x15'
  0x16: pC, // '\x16'
  0x17: pC, // '\x17'
  0x18: pC, // '\x18'
  0x19: pC, // '\x19'
  0x1a: pC, // '\x1a'
  0x1b: pC, // '\x1b'
  0x1c: pC, // '\x1c'
  0x1d: pC, // '\x1d'
  0x1e: pC, // '\x1e'
  0x1f: pC, // '\x1f'
  0x20: pZ | pp, // ' '
  0x21: pP | pp, // '!'
  0x22: pP | pp, // '"'
  0x23: pP | pp, // '#'
  0x24: pS | pp, // '$'
  0x25: pP | pp, // '%'
  0x26: pP | pp, // '&'
  0x27: pP | pp, // '\''
  0x28: pP | pp, // '('
  0x29: pP | pp, // ')'
  0x2a: pP | pp, // '*'
  0x2b: pS | pp, // '+'
  0x2c: pP | pp, // ','
  0x2d: pP | pp, // '-'
  0x2e: pP | pp, // '.'
  0x2f: pP | pp, // '/'
  0x30: pN | pp, // '0'
  0x31: pN | pp, // '1'
  0x32: pN | pp, // '2'
  0x33: pN | pp, // '3'
  0x34: pN | pp, // '4'
  0x35: pN | pp, // '5'
  0x36: pN | pp, // '6'
  0x37: pN | pp, // '7'
  0x38: pN | pp, // '8'
  0x39: pN | pp, // '9'
  0x3a: pP | pp, // ':'
  0x3b: pP | pp, // ';'
  0x3c: pS | pp, // '<'
  0x3d: pS | pp, // '='
  0x3e: pS | pp, // '>'
  0x3f: pP | pp, // '?'
  0x40: pP | pp, // '@'
  0x41: pLu | pp, // 'A'
  0x42: pLu | pp, // 'B'
  0x43: pLu | pp, // 'C'
  0x44: pLu | pp, // 'D'
  0x45: pLu | pp, // 'E'
  0x46: pLu | pp, // 'F'
  0x47: pLu | pp, // 'G'
  0x48: pLu | pp, // 'H'
  0x49: pLu | pp, // 'I'
  0x4a: pLu | pp, // 'J'
  0x4b: pLu | pp, // 'K'
  0x4c: pLu | pp, // 'L'
  0x4d: pLu | pp, // 'M'
  0x4e: pLu | pp, // 'N'
  0x4f: pLu | pp, // 'O'
  0x50: pLu | pp, // 'P'
  0x51: pLu | pp, // 'Q'
  0x52: pLu | pp, // 'R'
  0x53: pLu | pp, // 'S'
  0x54: pLu | pp, // 'T'
  0x55: pLu | pp, // 'U'
  0x56: pLu | pp, // 'V'
  0x57: pLu | pp, // 'W'
  0x58: pLu | pp, // 'X'
  0x59: pLu | pp, // 'Y'
  0x5a: pLu | pp, // 'Z'
  0x5b: pP | pp, // '['
  0x5c: pP | pp, // '\\'
  0x5d: pP | pp, // ']'
  0x5e: pS | pp, // '^'
  0x5f: pP | pp, // '_'
  0x60: pS | pp, // '`'
  0x61: pLl | pp, // 'a'
  0x62: pLl | pp, // 'b'
  0x63: pLl | pp, // 'c'
  0x64: pLl | pp, // 'd'
  0x65: pLl | pp, // 'e'
  0x66: pLl | pp, // 'f'
  0x67: pLl | pp, // 'g'
  0x68: pLl | pp, // 'h'
  0x69: pLl | pp, // 'i'
  0x6a: pLl | pp, // 'j'
  0x6b: pLl | pp, // 'k'
  0x6c: pLl | pp, // 'l'
  0x6d: pLl | pp, // 'm'
  0x6e: pLl | pp, // 'n'
  0x6f: pLl | pp, // 'o'
  0x70: pLl | pp, // 'p'
  0x71: pLl | pp, // 'q'
  0x72: pLl | pp, // 'r'
  0x73: pLl | pp, // 's'
  0x74: pLl | pp, // 't'
  0x75: pLl | pp, // 'u'
  0x76: pLl | pp, // 'v'
  0x77: pLl | pp, // 'w'
  0x78: pLl | pp, // 'x'
  0x79: pLl | pp, // 'y'
  0x7a: pLl | pp, // 'z'
  0x7b: pP | pp, // '{'
  0x7c: pS | pp, // '|'
  0x7d: pP | pp, // '}'
  0x7e: pS | pp, // '~'
  0x7f: pC, // '\u007f'
  0x80: pC, // '\u0080'
  0x81: pC, // '\u0081'
  0x82: pC, // '\u0082'
  0x83: pC, // '\u0083'
  0x84: pC, // '\u0084'
  0x85: pC, // '\u0085'
  0x86: pC, // '\u0086'
  0x87: pC, // '\u0087'
  0x88: pC, // '\u0088'
  0x89: pC, // '\u0089'
  0x8a: pC, // '\u008a'
  0x8b: pC, // '\u008b'
  0x8c: pC, // '\u008c'
  0x8d: pC, // '\u008d'
  0x8e: pC, // '\u008e'
  0x8f: pC, // '\u008f'
  0x90: pC, // '\u0090'
  0x91: pC, // '\u0091'
  0x92: pC, // '\u0092'
  0x93: pC, // '\u0093'
  0x94: pC, // '\u0094'
  0x95: pC, // '\u0095'
  0x96: pC, // '\u0096'
  0x97: pC, // '\u0097'
  0x98: pC, // '\u0098'
  0x99: pC, // '\u0099'
  0x9a: pC, // '\u009a'
  0x9b: pC, // '\u009b'
  0x9c: pC, // '\u009c'
  0x9d: pC, // '\u009d'
  0x9e: pC, // '\u009e'
  0x9f: pC, // '\u009f'
  0xa0: pZ, // '\u00a0'
  0xa1: pP | pp, // '¡'
  0xa2: pS | pp, // '¢'
  0xa3: pS | pp, // '£'
  0xa4: pS | pp, // '¤'
  0xa5: pS | pp, // '¥'
  0xa6: pS | pp, // '¦'
  0xa7: pP | pp, // '§'
  0xa8: pS | pp, // '¨'
  0xa9: pS | pp, // '©'
  0xaa: pLo | pp, // 'ª'
  0xab: pP | pp, // '«'
  0xac: pS | pp, // '¬'
  0xad: 0, // '\u00ad'
  0xae: pS | pp, // '®'
  0xaf: pS | pp, // '¯'
  0xb0: pS | pp, // '°'
  0xb1: pS | pp, // '±'
  0xb2: pN | pp, // '²'
  0xb3: pN | pp, // '³'
  0xb4: pS | pp, // '´'
  0xb5: pLl | pp, // 'µ'
  0xb6: pP | pp, // '¶'
  0xb7: pP | pp, // '·'
  0xb8: pS | pp, // '¸'
  0xb9: pN | pp, // '¹'
  0xba: pLo | pp, // 'º'
  0xbb: pP | pp, // '»'
  0xbc: pN | pp, // '¼'
  0xbd: pN | pp, // '½'
  0xbe: pN | pp, // '¾'
  0xbf: pP | pp, // '¿'
  0xc0: pLu | pp, // 'À'
  0xc1: pLu | pp, // 'Á'
  0xc2: pLu | pp, // 'Â'
  0xc3: pLu | pp, // 'Ã'
  0xc4: pLu | pp, // 'Ä'
  0xc5: pLu | pp, // 'Å'
  0xc6: pLu | pp, // 'Æ'
  0xc7: pLu | pp, // 'Ç'
  0xc8: pLu | pp, // 'È'
  0xc9: pLu | pp, // 'É'
  0xca: pLu | pp, // 'Ê'
  0xcb: pLu | pp, // 'Ë'
  0xcc: pLu | pp, // 'Ì'
  0xcd: pLu | pp, // 'Í'
  0xce: pLu | pp, // 'Î'
  0xcf: pLu | pp, // 'Ï'
  0xd0: pLu | pp, // 'Ð'
  0xd1: pLu | pp, // 'Ñ'
  0xd2: pLu | pp, // 'Ò'
  0xd3: pLu | pp, // 'Ó'
  0xd4: pLu | pp, // 'Ô'
  0xd5: pLu | pp, // 'Õ'
  0xd6: pLu | pp, // 'Ö'
  0xd7: pS | pp, // '×'
  0xd8: pLu | pp, // 'Ø'
  0xd9: pLu | pp, // 'Ù'
  0xda: pLu | pp, // 'Ú'
  0xdb: pLu | pp, // 'Û'
  0xdc: pLu | pp, // 'Ü'
  0xdd: pLu | pp, // 'Ý'
  0xde: pLu | pp, // 'Þ'
  0xdf: pLl | pp, // 'ß'
  0xe0: pLl | pp, // 'à'
  0xe1: pLl | pp, // 'á'
  0xe2: pLl | pp, // 'â'
  0xe3: pLl | pp, // 'ã'
  0xe4: pLl | pp, // 'ä'
  0xe5: pLl | pp, // 'å'
  0xe6: pLl | pp, // 'æ'
  0xe7: pLl | pp, // 'ç'
  0xe8: pLl | pp, // 'è'
  0xe9: pLl | pp, // 'é'
  0xea: pLl | pp, // 'ê'
  0xeb: pLl | pp, // 'ë'
  0xec: pLl | pp, // 'ì'
  0xed: pLl | pp, // 'í'
  0xee: pLl | pp, // 'î'
  0xef: pLl | pp, // 'ï'
  0xf0: pLl | pp, // 'ð'
  0xf1: pLl | pp, // 'ñ'
  0xf2: pLl | pp, // 'ò'
  0xf3: pLl | pp, // 'ó'
  0xf4: pLl | pp, // 'ô'
  0xf5: pLl | pp, // 'õ'
  0xf6: pLl | pp, // 'ö'
  0xf7: pS | pp, // '÷'
  0xf8: pLl | pp, // 'ø'
  0xf9: pLl | pp, // 'ù'
  0xfa: pLl | pp, // 'ú'
  0xfb: pLl | pp, // 'û'
  0xfc: pLl | pp, // 'ü'
  0xfd: pLl | pp, // 'ý'
  0xfe: pLl | pp, // 'þ'
  0xff: pLl | pp // 'ÿ'
}

// linearMax is the maximum size table for linear search for non-Latin1 rune.
// Derived by running 'go test -calibrate'.
const linearMax = 18

// is16 reports whether r is in the sorted slice of 16-bit ranges.
const is16 = (ranges: Range16[], r: number) => {
  if (ranges.length <= linearMax || r <= MaxLatin1) {
    for (let i = 0; i < ranges.length; i++) {
      const range_ = ranges[i] || { lo: 0, hi: 0, stride: 0 }
      if (r < range_.lo) {
        return false
      }
      if (r <= range_.hi) {
        return range_.stride === 1 || (r - range_.lo) % range_.stride === 0
      }
    }
    return false
  }

  // binary search over ranges
  let lo = 0
  let hi = ranges.length
  while (lo < hi) {
    const m = Math.floor(lo + (hi - lo) / 2)
    const range_ = ranges[m] || { lo: 0, hi: 0, stride: 0 }
    if (range_.lo <= r && r <= range_.hi) {
      return range_.stride === 1 || (r - range_.lo) % range_.stride === 0
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
        return range_.stride === 1 || (r - range_.lo) % range_.stride === 0
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
      return range_.stride === 1 || (r - range_.lo) % range_.stride === 0
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
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 32:
        return true
    }
    return false
  }
  return isExcludingLatin(White_Space, r)
}

// IsDigit reports whether the rune is a decimal digit.
export const isDigit = (r: number) => {
  if (r <= MaxLatin1) {
    return 48 <= r && r <= 57
  }
  return isExcludingLatin(digit, r)
}

// IsUpper reports whether the rune is an upper case letter.
export const isUpper = (r: number) => {
  // See comment in IsGraphic.
  if (r <= MaxLatin1) {
    return (_properties[r] & pLmask) === pLu
  }
  return isExcludingLatin(upper, r)
}
