export const makeOrdinal = (num: number) => {
  switch (num.toString().slice(-1)) {
    case '1':
      return `${num}st`
    case '2':
      return `${num}nd`
    case '3':
      return `${num}rd`
    default:
      return `${num}th`
  }
}
