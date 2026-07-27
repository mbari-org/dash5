import { renderHook } from '@testing-library/react'
import { useClearMarkerEditModeWhenLoggedOut } from './useClearMarkerEditModeWhenLoggedOut'

describe('useClearMarkerEditModeWhenLoggedOut', () => {
  it('clears add and edit mode when canEditMarkers becomes false', () => {
    const setIsAddingMarkers = jest.fn()
    const setActiveEditMarkerId = jest.fn()

    const { rerender } = renderHook(
      ({ canEditMarkers }) =>
        useClearMarkerEditModeWhenLoggedOut({
          canEditMarkers,
          isAddingMarkers: true,
          activeEditMarkerId: '42',
          setIsAddingMarkers,
          setActiveEditMarkerId,
        }),
      { initialProps: { canEditMarkers: true } }
    )

    expect(setIsAddingMarkers).not.toHaveBeenCalled()
    expect(setActiveEditMarkerId).not.toHaveBeenCalled()

    rerender({ canEditMarkers: false })

    expect(setIsAddingMarkers).toHaveBeenCalledWith(false)
    expect(setActiveEditMarkerId).toHaveBeenCalledWith(null)
  })

  it('does not clear when already idle and canEditMarkers is false', () => {
    const setIsAddingMarkers = jest.fn()
    const setActiveEditMarkerId = jest.fn()

    renderHook(() =>
      useClearMarkerEditModeWhenLoggedOut({
        canEditMarkers: false,
        isAddingMarkers: false,
        activeEditMarkerId: null,
        setIsAddingMarkers,
        setActiveEditMarkerId,
      })
    )

    expect(setIsAddingMarkers).not.toHaveBeenCalled()
    expect(setActiveEditMarkerId).not.toHaveBeenCalled()
  })

  it('does not clear while canEditMarkers stays true', () => {
    const setIsAddingMarkers = jest.fn()
    const setActiveEditMarkerId = jest.fn()

    renderHook(() =>
      useClearMarkerEditModeWhenLoggedOut({
        canEditMarkers: true,
        isAddingMarkers: true,
        activeEditMarkerId: '7',
        setIsAddingMarkers,
        setActiveEditMarkerId,
      })
    )

    expect(setIsAddingMarkers).not.toHaveBeenCalled()
    expect(setActiveEditMarkerId).not.toHaveBeenCalled()
  })

  it('clears add and edit mode when the map view unmounts', () => {
    const setIsAddingMarkers = jest.fn()
    const setActiveEditMarkerId = jest.fn()

    const { unmount } = renderHook(() =>
      useClearMarkerEditModeWhenLoggedOut({
        canEditMarkers: true,
        isAddingMarkers: true,
        activeEditMarkerId: '42',
        setIsAddingMarkers,
        setActiveEditMarkerId,
      })
    )

    expect(setIsAddingMarkers).not.toHaveBeenCalled()
    expect(setActiveEditMarkerId).not.toHaveBeenCalled()

    unmount()

    expect(setIsAddingMarkers).toHaveBeenCalledWith(false)
    expect(setActiveEditMarkerId).toHaveBeenCalledWith(null)
  })
})
