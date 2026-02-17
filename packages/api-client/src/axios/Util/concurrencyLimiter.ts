// Concurrency limiter for script fetches
export const createLimiter = (concurrency: number) => {
  let activeCount = 0
  const queue: Array<() => void> = []
  const next = () => {
    if (queue.length === 0 || activeCount >= concurrency) return
    activeCount++
    const run = queue.shift()!
    run()
  }
  return <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const task = () => {
        fn()
          .then((value) => resolve(value))
          .catch(reject)
          .finally(() => {
            activeCount--
            next()
          })
      }
      queue.push(task)
      next()
    })
}
