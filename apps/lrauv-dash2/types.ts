export type FilteringType = 'LITERAL' | 'GLOB' | 'REGEX'

export const isFilteringType = (value: string): value is FilteringType =>
  value === 'LITERAL' || value === 'GLOB' || value === 'REGEX'

export interface FilterRowUi {
  eventKindName: string
  textFilter: string
  filteringType: FilteringType
  vehiclesChecked: Record<string, boolean>
  regexError?: string | null
  isEditing?: boolean
}
