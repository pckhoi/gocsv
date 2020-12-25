import SliceReader from '../src/slice_reader'
import { byte, decodeBytes } from '../src/byte'
import { stringStream, bytesStream } from '../src/io'

describe('SliceReader', () => {
  it('reads string', async () => {
    const r = new SliceReader('abc,def')
    let buf = r.readSlice(byte(','))
    expect(decodeBytes(buf as Uint8Array)).toEqual('abc,')
    buf = r.readSlice(byte(','))
    expect(decodeBytes(buf as Uint8Array)).toEqual('def')
    buf = r.readSlice(byte(','))
    expect(buf).toBeNull()
    expect(r.eof).toBeTruthy()
  })

  it('read bytes', () => {
    const r = new SliceReader(new TextEncoder().encode('abc,def'))
    let buf = r.readSlice(byte(','))
    expect(decodeBytes(buf as Uint8Array)).toEqual('abc,')
    buf = r.readSlice(byte(','))
    expect(decodeBytes(buf as Uint8Array)).toEqual('def')
    buf = r.readSlice(byte(','))
    expect(buf).toBeNull()
    expect(r.eof).toBeTruthy()
  })

  it('read string stream', async () => {
    const stream = stringStream('abc,def\n123,456\n', 3)
    const r = new SliceReader(stream)
    for (let i = 0; i < 3; i++) {
      await r.fill()
      let line = r.readSlice(byte('\n'))
      expect(decodeBytes(line as Uint8Array)).toEqual('abc,def\n')
      line = r.readSlice(byte('\n'))
      expect(decodeBytes(line as Uint8Array)).toEqual('123,456\n')
      line = r.readSlice(byte('\n'))
      expect(line).toBeNull()
      expect(r.eof).toBeFalsy()
    }
    await r.fill()
    const line = r.readSlice(byte('\n'))
    expect(line).toBeNull()
    expect(r.eof).toBeTruthy()
  })

  it('read bytes stream', async () => {
    const stream = bytesStream(new TextEncoder().encode('abc,def\n123,456\n'), 3)
    const r = new SliceReader(stream)
    for (let i = 0; i < 3; i++) {
      await r.fill()
      let line = r.readSlice(byte('\n'))
      expect(decodeBytes(line as Uint8Array)).toEqual('abc,def\n')
      line = r.readSlice(byte('\n'))
      expect(decodeBytes(line as Uint8Array)).toEqual('123,456\n')
      line = r.readSlice(byte('\n'))
      expect(line).toBeNull()
      expect(r.eof).toBeFalsy()
    }
    await r.fill()
    const line = r.readSlice(byte('\n'))
    expect(line).toBeNull()
    expect(r.eof).toBeTruthy()
  })

  it('read partial stream', async () => {
    let i = 0
    const stream = new ReadableStream({
      pull(controller) {
        if (i === 0) {
          controller.enqueue('abc,')
        } else if (i === 1) {
          controller.enqueue('def\n')
        } else {
          controller.close()
        }
        i++
      },
    })
    const r = new SliceReader(stream)
    await r.fill()
    let line = r.readSlice(byte('\n'))
    expect(line).toBeNull()
    expect(r.eof).toBeFalsy()
    await r.fill()
    line = r.readSlice(byte('\n'))
    expect(decodeBytes(line as Uint8Array)).toEqual('abc,def\n')
    line = r.readSlice(byte('\n'))
    expect(line).toBeNull()
    await r.fill()
    expect(r.eof).toBeTruthy()
  })
})
