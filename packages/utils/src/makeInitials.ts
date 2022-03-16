export const makeInitials = (s: string, max: number) =>
  s
    .split(' ')
    .filter((_, i) => i <= max - 1)
    .map((w) => w.charAt(0))
    .join('')
