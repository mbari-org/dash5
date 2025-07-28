const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const abbreviateUnitsInCommand = (
  command: string,
  units: { name: string; abbreviation: string }[]
): string => {
  if (!units || units.length === 0) return command

  let updated = command
  units.forEach(({ name, abbreviation }) => {
    if (!abbreviation || name === abbreviation) return
    // Do not replace degree with arcdeg
    if (name === 'degree' || abbreviation.toLowerCase() === 'arcdeg') return

    const pattern = new RegExp(
      `(^|\\s)${escapeRegExp(name)}(?=(?:\\s|;|\"|$))`,
      'g'
    )
    updated = updated.replace(
      pattern,
      (_, prefix: string) => `${prefix}${abbreviation}`
    )
  })
  return updated
}
