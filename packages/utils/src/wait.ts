/**
 * A convenience method used to simulate loading.
 * @param seconds The amount of seconds to wait.
 */
export const wait = (seconds: number) =>
  new Promise<void>((res) => {
    setTimeout(() => res(), seconds * 1000)
  })
