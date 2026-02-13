
const TWO_MIB = 2 * 1024 * 1024
const ZERO_CHUNK = new Uint8Array(64 * 1024)
const PORT = 3245

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url)

    if (url.pathname !== "/2mb") {
      return new Response("OK\nTry /2mb\n", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    }

    // random delay so requests get interleaved properly 
    let delay = Math.max(10, Math.random() * 10 + 10)

    // Stream zeros until we hit exactly 2 MiB
    let sent = 0
    const stream = new ReadableStream({
      pull: async (controller) => {
        const remaining = TWO_MIB - sent
        if (remaining <= 0) {
          controller.close()
          return
        }

        await new Promise((resolve) => setTimeout(resolve, delay))

        const n = Math.min(remaining, ZERO_CHUNK.byteLength)
        controller.enqueue(n === ZERO_CHUNK.byteLength ? ZERO_CHUNK : ZERO_CHUNK.subarray(0, n))
        sent += n
      },
    })

    return new Response(stream, {
      headers: {
        "content-type": "application/octet-stream",
        "cache-control": "no-store",
      },
    })
  },
})

console.log(`Listening on http://localhost:${PORT} (GET /2mb)`)
