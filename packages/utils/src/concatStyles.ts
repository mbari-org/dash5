import clsx, { ClassValue } from 'clsx'

export const concatStyles = (...styles: ClassValue[]): string => clsx(...styles)
