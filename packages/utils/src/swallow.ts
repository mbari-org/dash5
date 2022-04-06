export const swallow =
  (block?: () => void | Promise<void>) => async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await block?.()
  }
