const hexRegex = /^#([A-F0-9]{6}|[A-F0-9]{3})$/i

export const isHexColor = (str: string): boolean => hexRegex.test(str)
