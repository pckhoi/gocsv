export const stringStream = (s?: string) =>
  new ReadableStream({
    start(controller) {
      if (s) controller.enqueue(s)
      controller.close()
    }
  })
