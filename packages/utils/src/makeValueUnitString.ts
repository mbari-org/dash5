// Creates a combined string out of a value and a unit
// Works for speed, velocity, etc type units that are separated by underscores (ie meter_per_second)

export const makeValueUnitString = (value: string, unit?: string) => {
  if (!unit) return value
  if (unit.indexOf('_') !== -1 && Number(value) !== 1) {
    const multiwordUnit = unit
      .split('_')
      .map((word: string, index: number) => (index === 0 ? `${word}s` : word))
      .join('_')

    return `${value} ${multiwordUnit}`
  }
  const valueAndUnit = `${value} ${unit}`

  return (Number(value) || value === 'NaN') && Number(value) !== 1
    ? `${valueAndUnit}s`
    : valueAndUnit
}
