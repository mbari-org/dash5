export const COLORS = [
  '#0778B1',
  '#6E53A0',
  '#35499E',
  '#42BC99',
  '#31B44A',
  '#CF342A',
  '#E54D25',
  '#E5245D',
  '#C24398',
  '#22A3D6',
  '#51C5CF',
  '#A152A0',
  '#EF3A4A',
]

/**
 * Generates a random color from a series of preset options.
 */
export const randomColor = () => {
  const randomIndex = Math.random() * (COLORS.length - 1)
  const maxIndex = COLORS.length - 1
  const index = Math.round(Math.max(0, Math.min(randomIndex, maxIndex)))
  return COLORS[index]
}
