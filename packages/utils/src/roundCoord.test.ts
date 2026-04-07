import { roundCoord } from './roundCoord'

describe('roundCoord', () => {
  it('should round to the default number of decimals (5)', () => {
    expect(roundCoord(36.80552223720666)).toBe(36.80552)
  })

  it('should round to a custom number of decimals', () => {
    expect(roundCoord(36.80774, 2)).toBe(36.81)
  })

  it('should handle negative values', () => {
    expect(roundCoord(-119.822222, 5)).toBe(-119.82222)
  })

  it('should support decimals = 0', () => {
    expect(roundCoord(1.5, 0)).toBe(2)
  })

  it('should return NaN when input is NaN', () => {
    expect(Number.isNaN(roundCoord(NaN))).toBe(true)
  })
})
