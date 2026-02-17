import { createLogger } from './logger'

describe('createLogger', () => {
  const originalConsole = { ...console }
  let mockConsole: { [key: string]: jest.Mock }

  beforeEach(() => {
    // Mockup all console methods
    mockConsole = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    Object.assign(console, mockConsole)
  })

  afterEach(() => {
    // Restore original console
    Object.assign(console, originalConsole)
  })

  it('should create a logger with the correct component name', () => {
    // Arrange
    const logger = createLogger('TestComponent')

    // Act
    logger.debug('Test message')

    // Assert
    expect(mockConsole.debug).toHaveBeenCalledWith(
      '[TestComponent] Test message'
    )
  })

  it('should pass additional arguments to console methods', () => {
    // Arrange
    const logger = createLogger('TestComponent')
    const testObject = { foo: 'bar' }

    // Act
    logger.info('Test message', testObject)

    // Assert
    expect(mockConsole.info).toHaveBeenCalledWith(
      '[TestComponent] Test message',
      testObject
    )
  })

  // Test production behavior
  it('should not log debug messages in production', () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const logger = createLogger('TestComponent')

    // Act
    logger.debug('This should not be logged')

    // Assert
    expect(mockConsole.debug).not.toHaveBeenCalled()

    // Cleanup
    process.env.NODE_ENV = originalNodeEnv
  })
})
