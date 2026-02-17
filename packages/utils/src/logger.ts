export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'

interface ILogger {
  debug: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
}

/**
 * Creates a logger instance for a specific component
 * @param component - The name of the component using the logger
 * @returns Logger instance with debug, info, warn and error methods
 */
export function createLogger(component: string): ILogger {
  // Safe environment variable access
  const isProduction =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'production'

  const logsEnabled =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true'

  return {
    debug: (message: string, ...args: any[]): void => {
      if (!isProduction || logsEnabled) {
        console.debug(`[${component}] ${message}`, ...args)
      }
    },
    info: (message: string, ...args: any[]): void => {
      if (!isProduction || logsEnabled) {
        console.info(`[${component}] ${message}`, ...args)
      }
    },
    warn: (message: string, ...args: any[]): void => {
      console.warn(`[${component}] ${message}`, ...args)
    },
    error: (message: string, ...args: any[]): void => {
      console.error(`[${component}] ${message}`, ...args)
    },
  }
}
