export interface FieldError {
  name: string
  message: string
}

export interface ErrorMap {
  [key: string]: FieldError | undefined
}
