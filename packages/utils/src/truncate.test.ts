import { truncate } from './truncate'

describe('truncate', () => {
  it('should return the original string if it is shorter than the max length', () => {
    const str = 'Hello World'
    expect(truncate(str, 20)).toBe(str)
  })

  it('should truncate a string to the specified length', () => {
    const str = 'This is a very long string that should be truncated'
    expect(truncate(str, 10)).toBe('This is...')
  })

  it('should use the default length of 100 if not specified', () => {
    const str = 'A'.repeat(99)
    expect(truncate(str)).toBe(str)

    const longStr = 'A'.repeat(110)
    expect(truncate(longStr)).toBe('A'.repeat(97) + '...')
  })

  it('should use a custom separator', () => {
    const str = 'This should be truncated with a custom separator'
    expect(truncate(str, 15, '***')).toBe('This should ***')
  })

  it('should handle tail parameter correctly', () => {
    const str = 'Keep the beginning and the end of this long string'
    expect(truncate(str, 20, '...', 3)).toBe('Keep the begin...ing')
  })

  it('should handle null length by returning the original string', () => {
    const str = 'Original string'
    // @ts-ignore - Testing the null case mentioned in the function
    expect(truncate(str, null)).toBe(str)
  })

  it('should handle edge cases with very short strings and lengths', () => {
    expect(truncate('abc', 2, '.')).toBe('a.')
    // When length is 3 and separator is '.', it can still fit the entire string "abc"
    expect(truncate('abc', 3, '.')).toBe('abc')
    expect(truncate('abc', 4, '.')).toBe('abc')
  })

  it('should handle edge cases with tail parameter', () => {
    const str = 'Beginning and end'
    // Based on implementation, with tail=10, we'll get "...ng and end"
    expect(truncate(str, 10, '...', 10)).toBe('...ng and end')
    expect(truncate(str, 12, '...', 3)).toBe('Beginn...end')
    expect(truncate(str, 12, '...', 0)).toBe('Beginning...')
  })
})
