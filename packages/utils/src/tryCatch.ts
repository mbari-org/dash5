export const tryCatch = (tryFunc: Function, catchFunc: Function): any => {
  try {
    return tryFunc()
  } catch (error) {
    return catchFunc(error)
  }
}
