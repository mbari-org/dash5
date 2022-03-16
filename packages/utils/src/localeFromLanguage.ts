const SUPPORTED_LOCALES = ['en', 'es']

const getSupportedLocales = () => {
  const locales = (process.env.SUPPORTED_LOCALES ?? '').split(',')
  return locales.length > 0 ? locales : SUPPORTED_LOCALES
}

export const localeFromLanguage = (language: string) => {
  const supported = getSupportedLocales()
  const locale = (language || '').split('-')[0]
  return supported.includes(locale) ? locale : supported[0]
}
