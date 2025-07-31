export const getUnitFromAbbreviation = (
  abbreviation?: string,
  unitsData?: { abbreviation: string; name: string }[]
) => {
  if (!abbreviation || !unitsData) return undefined
  if (abbreviation.toLowerCase() === 'degree') return 'degree'
  return unitsData?.find(
    (u) => u.abbreviation?.toLowerCase() === (abbreviation ?? '').toLowerCase()
  )?.name
}
