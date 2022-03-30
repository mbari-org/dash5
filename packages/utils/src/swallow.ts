export const swallow =
  (block?: () => void | Promise<void>) => async (e: React.MouseEvent) => {
    e.preventDefault()
    await block?.()
  }
