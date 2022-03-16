export const flat = (arr: any[], d = 1): any[] =>
  typeof arr.flat === 'function' ? arr.flat(d) : flatDeep(arr, d)

export const flatDeep = (arr: any[], d = 1): any[] =>
  d > 0
    ? arr.reduce(
        (acc, val) =>
          acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val),
        []
      )
    : arr.slice()
