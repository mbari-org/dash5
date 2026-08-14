import {
  classifyMeasurement,
  CLOSE_RADIUS_PX,
  isWithinCloseRadius,
} from './Measurement.utils'

describe('classifyMeasurement', () => {
  it('treats a single vertex as a point', () => {
    expect(classifyMeasurement(1, false)).toBe('point')
    expect(classifyMeasurement(1, true)).toBe('point')
  })

  it('treats two vertices as a line', () => {
    expect(classifyMeasurement(2, false)).toBe('line')
  })

  it('keeps three or more vertices as a line until explicitly closed', () => {
    expect(classifyMeasurement(3, false)).toBe('line')
    expect(classifyMeasurement(8, false)).toBe('line')
  })

  it('classifies a closed shape with three or more vertices as an area', () => {
    expect(classifyMeasurement(3, true)).toBe('area')
    expect(classifyMeasurement(5, true)).toBe('area')
  })
})

describe('isWithinCloseRadius', () => {
  it('closes when the click is on the first vertex', () => {
    expect(isWithinCloseRadius(0)).toBe(true)
  })

  it('closes when the click is within the pixel radius', () => {
    expect(isWithinCloseRadius(CLOSE_RADIUS_PX)).toBe(true)
  })

  it('does not close when the click is outside the pixel radius', () => {
    expect(isWithinCloseRadius(CLOSE_RADIUS_PX + 1)).toBe(false)
  })
})
