export const swallow = (block?: () => void | Promise<void>) => async (
  e: React.MouseEvent | React.FocusEvent | React.KeyboardEvent
) => {
  e.preventDefault()
  e.stopPropagation()
  await block?.()
}
