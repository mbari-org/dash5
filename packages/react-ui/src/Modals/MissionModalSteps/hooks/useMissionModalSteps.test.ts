import { renderHook, act } from '@testing-library/react'
import useMissionModalSteps from './useMissionModalSteps'

// steps order: Mission(0) Waypoints(1) Parameters(2) Safety&Comms(3) Review(4) Schedule(5) Confirm(6) SendCommand(7)

const baseProps = {
  initialIndex: 0,
  defaultParameters: [{ name: 'speed', value: '1' }],
  updatedParameters: [],
  safetyParams: [{ name: 'timeout', value: '60' }],
  commsParams: [{ name: 'interval', value: '30' }],
  waypoints: [{ latName: 'lat', lonName: 'lon', lat: '36.0', lon: '-122.0' }],
}

describe('useMissionModalSteps — forward navigation', () => {
  it('starts at initialIndex', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 0 })
    )
    expect(result.current.currentStep).toBe(0)
  })

  it('advances to next step on handleNext', () => {
    const { result } = renderHook(() => useMissionModalSteps(baseProps))
    act(() => result.current.handleNext())
    expect(result.current.currentStep).toBe(1) // Waypoints
  })

  it('shows summary screen when advancing from Waypoints (step 1) before moving on', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 1 })
    )
    expect(result.current.showSummary).toBe(false)
    act(() => result.current.handleNext())
    expect(result.current.showSummary).toBe(true)
    expect(result.current.currentStep).toBe(1) // still on Waypoints — showing summary
  })

  it('advances past Waypoints summary on second Next', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 1 })
    )
    act(() => result.current.handleNext()) // triggers summary
    act(() => result.current.handleNext()) // advances past summary
    expect(result.current.currentStep).toBe(2) // Parameters
    expect(result.current.showSummary).toBe(false)
  })

  it('shows summary from Parameters (step 2) when there are overridden params', () => {
    const props = {
      ...baseProps,
      initialIndex: 2,
      updatedParameters: [{ name: 'speed', value: '2', overrideValue: '3' }],
    }
    const { result } = renderHook(() => useMissionModalSteps(props))
    act(() => result.current.handleNext())
    expect(result.current.showSummary).toBe(true)
    expect(result.current.currentStep).toBe(2)
  })

  it('skips Waypoints step when waypoints array is empty', () => {
    const props = { ...baseProps, waypoints: [], initialIndex: 0 }
    const { result } = renderHook(() => useMissionModalSteps(props))
    act(() => result.current.handleNext()) // from Mission(0)
    expect(result.current.currentStep).toBe(2) // skips Waypoints(1) → Parameters(2)
  })
})

describe('useMissionModalSteps — Back navigation', () => {
  it('goes back one step from Parameters (2) to Waypoints (1) with summary', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 2 })
    )
    act(() => result.current.handlePrevious())
    expect(result.current.currentStep).toBe(1) // Waypoints
    expect(result.current.showSummary).toBe(true) // summary re-shown on landing
  })

  it('Back from Waypoints summary dismisses summary without changing step', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 1 })
    )
    act(() => result.current.handleNext()) // triggers summary
    expect(result.current.showSummary).toBe(true)
    act(() => result.current.handlePrevious()) // Back while on summary
    expect(result.current.showSummary).toBe(false)
    expect(result.current.currentStep).toBe(1) // still on Waypoints
  })

  it('Back from Safety&Comms (3) returns to Parameters summary when params are overridden', () => {
    const props = {
      ...baseProps,
      initialIndex: 3,
      updatedParameters: [{ name: 'speed', value: '2', overrideValue: '3' }],
    }
    const { result } = renderHook(() => useMissionModalSteps(props))
    act(() => result.current.handlePrevious()) // from Safety&Comms → Parameters
    expect(result.current.currentStep).toBe(2) // Parameters
    expect(result.current.showSummary).toBe(true)
  })

  it('Back from Safety&Comms returns to Parameters (no summary) when no params are overridden', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 3 })
    )
    act(() => result.current.handlePrevious())
    expect(result.current.currentStep).toBe(2) // Parameters
    expect(result.current.showSummary).toBe(false)
  })

  it('skips Waypoints when navigating Back with empty waypoints', () => {
    const props = { ...baseProps, waypoints: [], initialIndex: 2 }
    const { result } = renderHook(() => useMissionModalSteps(props))
    act(() => result.current.handlePrevious()) // from Parameters(2)
    expect(result.current.currentStep).toBe(0) // skips Waypoints(1) → Mission(0)
  })

  it('does not go below step 0', () => {
    const { result } = renderHook(() =>
      useMissionModalSteps({ ...baseProps, initialIndex: 0 })
    )
    act(() => result.current.handlePrevious())
    expect(result.current.currentStep).toBe(0)
  })
})
