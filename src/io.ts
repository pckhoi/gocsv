export const stringStream = (s?: string, time = 1): ReadableStream<string> =>
  new ReadableStream({
    pull(controller) {
      if (!s || time <= 0) {
        controller.close()
        return
      }
      controller.enqueue(s)
      time--
    }
  })

export const bytesStream = (b: Uint8Array, time = 1): ReadableStream<Uint8Array> =>
  new ReadableStream({
    pull(controller) {
      if (!b || time <= 0) {
        controller.close()
        return
      }
      controller.enqueue(b)
      time--
    }
  })
