import http from "http"

const URL = "http://localhost:3245/2mb"

// See README.md for instructions on running this test. 

const REQUEST_TIMEOUT_MS = 5000
const NUM_WORKERS = 3
const NUM_ITERATIONS = 3

let promises = []
for (let w = 0; w < NUM_WORKERS; w++) {
  promises.push(workerLoop(w))
}

await Promise.all(promises)

console.log("All workers completed")


async function workerLoop(workerId) {
  for (let iter = 0; iter < NUM_ITERATIONS; iter++) {
    await downloadOnce(workerId, iter)
  }
}

function downloadOnce(workerId, iteration) {
  const logIter = (...args) => console.log(`[w ${workerId}, i ${iteration}]:`, ...args)
  const warnIter = (...args) => console.warn(`[w ${workerId}, i ${iteration}]:`, ...args)
  logIter("Starting download")
  let time0 = performance.now()

  return new Promise((resolve) => {
    const req = http.get(URL, (res) => {
      let total = 0
      let finished = false
      logIter(`Header received ${res.statusCode} ${res.statusMessage}`)

      // timeout if 'end' not reached
      const timeout = setTimeout(() => {
        if (!finished) {
          finished = true
          warnIter(`Request timed out after ${REQUEST_TIMEOUT_MS} ms, with ${total} bytes received`)
          req.destroy(new Error("timeout waiting for end"))
        }
      }, REQUEST_TIMEOUT_MS)

      res.on("data", (chunk) => {
        total += chunk.length
      })

      res.on("end", () => {
        if (finished) return
        finished = true
        clearTimeout(timeout)
        let timeMs = performance.now() - time0
        logIter(`All bytes received ${total} bytes in ${timeMs.toFixed(0)} ms`)
        resolve()
      })

      res.on("error", (err) => {
        finished = true
        clearTimeout(timeout)
        warnIter(`Response error: ${err.message}`)
        resolve()
      })
    })

    req.on("error", (err) => {
      warnIter(`Request error: ${err.message}`)
      resolve()
    })
  })
}
