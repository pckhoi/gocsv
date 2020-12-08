export const stringStream = (s: string) =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(s)
      controller.close()
    }
  })
