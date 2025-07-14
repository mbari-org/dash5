// Creates a combined string out of a value and a unit
// Works for speed, velocity, etc type units that are separated by underscores (ie meter_per_second)
// Displays boolean values as true/false instead of 1/0

export const makeValueUnitString = (value: string, unit?: string) => {
  if (!unit) return value
  if (unit.indexOf('_') !== -1 && Number(value) !== 1) {
    const multiwordUnit = unit
      .split('_')
      .map((word: string, index: number) => (index === 0 ? `${word}s` : word))
      .join('_')

    return `${value} ${multiwordUnit}`
  }
  if (unit === 'bool') {
    const boolValue =
      value.toLowerCase() === 'true' || value === '1' ? 'true' : 'false'
    return `${boolValue} ${unit}`
  }
  const valueAndUnit = `${value} ${unit}`

  return (Number(value) || value === 'NaN') && Number(value) !== 1
    ? `${valueAndUnit}s`
    : valueAndUnit
}
