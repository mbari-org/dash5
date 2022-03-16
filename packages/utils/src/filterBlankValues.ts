interface AttributedItem {
  [key: string]: any
}

/**
 * Determines if any value is not blank.
 * @param i A value to test for blank.
 */
const notBlank = (i: any) => {
  switch (typeof i) {
    case 'undefined':
      return false
    case 'boolean':
      return true
    case 'string':
      return i.length > 0
    case 'number':
      return true
    case 'object':
      return i !== null
    default:
      return i
  }
}

/**
 * Returns any nested blank values from an array. Otherwise simply returns the item.
 * @param item The item to test.
 */
const filterNestedBlankValues = (item: string | string[] | any) => {
  try {
    return typeof item === 'object'
      ? item.filter
        ? item.filter((i: any) => notBlank(i)) // filter non-null values in a nested array
        : filterBlankAttributes(item) // recursively process a nested object
      : item
  } catch (e) {
    // tslint:disable no-console
    console.log('Could not filter non-null attribute for item:')
    console.log(item)
    console.log('----------------------------------')
    console.log(e)
    // tslint:enable no-console
    return item
  }
}

/**
 * Removes any blank attributes from an object.
 * @param item An object to filter any blank values.
 */
export const filterBlankAttributes = (item: AttributedItem): AttributedItem =>
  Object.keys(item)
    .filter((k) => notBlank(item[k]))
    .reduce((p, k) => ({ ...p, [k]: filterNestedBlankValues(item[k]) }), {})
