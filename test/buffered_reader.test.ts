import BufferedReader from '../src/buffered_reader'
import { byte, decodeBytes } from '../src/byte'
import { stringStream } from '../src/io'

describe('BufferedReader', () => {
  describe('readSlice', () => {
    it('reads slice', async () => {
      const input = stringStream('abc,def')
      const r = new BufferedReader(input)
      let buf = await r.readSlice(byte(','))
      expect(decodeBytes(buf)).toEqual('abc,')
      buf = await r.readSlice(byte(','))
      expect(decodeBytes(buf)).toEqual('def')
      buf = await r.readSlice(byte(','))
      expect(buf.length).toEqual(0)
    })

    it('throws buffer full', async () => {
      expect.assertions(3)
      const longString =
        'And now, hello, world! It is the time for all good men to come to the aid of their party'
      const buf = new BufferedReader(stringStream(longString), 16)
      try {
        await buf.readSlice(byte('!'))
      } catch (err) {
        expect(err.message).toEqual('BufferedReader: buffer is full')
      }
      expect(decodeBytes(buf.line)).toEqual('And now, hello, ')
      const line = await buf.readSlice(byte('!'))
      expect(decodeBytes(line)).toEqual('world!')
    })
  })

  describe('sliceStream', () => {
    it('return readable stream', async () => {
      const input = stringStream('abc,def')
      const r = new BufferedReader(input)
      const stream = r.sliceStream(',')
      const rd = stream.getReader()
      let s = await rd.read()
      expect(s.value).toBeInstanceOf(Uint8Array)
      expect(decodeBytes(s.value)).toEqual('abc,')
      s = await rd.read()
      expect(decodeBytes(s.value)).toEqual('def')
      s = await rd.read()
      expect(s.done).toEqual(true)
    })
  })
})
