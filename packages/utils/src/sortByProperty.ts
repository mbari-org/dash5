interface AttributedItem {
  [key: string]: any
}

const comparisonTerm = (
  item: AttributedItem,
  property: keyof AttributedItem
) => {
  // Determines if item property type is sortable and makes strings lowercase for more accurate comparison.
  switch (typeof item[property]) {
    case 'string':
      return item[property].toLowerCase()
    case 'number':
    case 'boolean':
    case 'undefined':
      return item[property]
    default:
      return null
  }
}

function sortByProperty({
  arrOfObj,
  sortProperty,
  secondarySort,
  sortAscending = true,
}: {
  arrOfObj: AttributedItem[]
  sortProperty: keyof AttributedItem
  secondarySort?: keyof AttributedItem
  sortAscending?: boolean
}) {
  // Returns original array if attempting to sort items that aren't objects or sort by a property that is a non-primitive data type.
  if (
    arrOfObj
      .map(
        (item) => comparisonTerm(item, sortProperty) && typeof item === 'object'
      )
      .includes(null)
  ) {
    // tslint:disable no-console
    console.log(
      'Only arrays containing objects with primitive data type values can be sorted.'
    )
    // tslint:enable no-console
    return arrOfObj
  }

  // Sorts an array of objects alphabetically by a selected property. Optionally, sorts items that have identical primary sort values by a secondary sort property.

  return arrOfObj.sort((a, b) => {
    const a1 = comparisonTerm(a, sortProperty)
    const b1 = comparisonTerm(b, sortProperty)
    const a2 = comparisonTerm(a, secondarySort ?? '')
    const b2 = comparisonTerm(b, secondarySort ?? '')

    const nonSortable = !a1 || !b1
    if (nonSortable) return 1
    if (a1 > b1) return sortAscending ? 1 : -1
    if (a1 < b1) return sortAscending ? -1 : 1

    if (secondarySort && sortProperty !== secondarySort) {
      const nonSortableSecondary = !a2 || !b2
      if (nonSortableSecondary) return 1
      return a2 > b2 ? 1 : -1
    }

    return 0
  })
}

export { sortByProperty }
