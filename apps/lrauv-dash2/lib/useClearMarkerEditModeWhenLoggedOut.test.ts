import { renderHook } from '@testing-library/react'
import { useClearMarkerEditModeWhenLoggedOut } from './useClearMarkerEditModeWhenLoggedOut'

describe('useClearMarkerEditModeWhenLoggedOut', () => {
  it('clears the edit session when canEditMarkers becomes false', () => {
    const clearMarkerEditSession = jest.fn()

    const { rerender } = renderHook(
      ({ canEditMarkers }) =>
        useClearMarkerEditModeWhenLoggedOut({
          canEditMarkers,
          clearMarkerEditSession,
        }),
      { initialProps: { canEditMarkers: true } }
    )

    expect(clearMarkerEditSession).not.toHaveBeenCalled()

    rerender({ canEditMarkers: false })

    expect(clearMarkerEditSession).toHaveBeenCalledTimes(1)
  })

  it('clears the edit session on mount when canEditMarkers is already false', () => {
    const clearMarkerEditSession = jest.fn()

    renderHook(() =>
      useClearMarkerEditModeWhenLoggedOut({
        canEditMarkers: false,
        clearMarkerEditSession,
      })
    )

    expect(clearMarkerEditSession).toHaveBeenCalledTimes(1)
  })

  it('does not clear while canEditMarkers stays true', () => {
    const clearMarkerEditSession = jest.fn()

    renderHook(() =>
      useClearMarkerEditModeWhenLoggedOut({
        canEditMarkers: true,
        clearMarkerEditSession,
      })
    )

    expect(clearMarkerEditSession).not.toHaveBeenCalled()
  })

  it('clears the edit session when the map view unmounts', () => {
    const clearMarkerEditSession = jest.fn()

    const { unmount } = renderHook(() =>
      useClearMarkerEditModeWhenLoggedOut({
        canEditMarkers: true,
        clearMarkerEditSession,
      })
    )

    expect(clearMarkerEditSession).not.toHaveBeenCalled()

    unmount()

    expect(clearMarkerEditSession).toHaveBeenCalledTimes(1)
  })
})
