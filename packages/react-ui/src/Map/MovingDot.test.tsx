import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import MovingDot from './MovingDot'

describe('MovingDot', () => {
  it('renders nothing when editing is false', () => {
    const { container } = render(<MovingDot editing={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the dot when editing is true', () => {
    render(<MovingDot editing={true} />)
    expect(screen.getByTestId('moving-dot')).toBeInTheDocument()
  })

  it('adds a mousemove listener when editing becomes true', () => {
    const addSpy = jest.spyOn(document, 'addEventListener')
    render(<MovingDot editing={true} />)
    expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    addSpy.mockRestore()
  })

  it('does not add a mousemove listener when editing is false', () => {
    const addSpy = jest.spyOn(document, 'addEventListener')
    render(<MovingDot editing={false} />)
    expect(addSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function))
    addSpy.mockRestore()
  })

  it('removes the listener when editing transitions true → false', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener')
    const { rerender } = render(<MovingDot editing={true} />)
    rerender(<MovingDot editing={false} />)
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('removes the listener on unmount while editing is true', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener')
    const { unmount } = render(<MovingDot editing={true} />)
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('add and remove calls are balanced across multiple editing toggles', () => {
    const addSpy = jest.spyOn(document, 'addEventListener')
    const removeSpy = jest.spyOn(document, 'removeEventListener')

    const { rerender, unmount } = render(<MovingDot editing={false} />)
    rerender(<MovingDot editing={true} />)
    rerender(<MovingDot editing={false} />)
    rerender(<MovingDot editing={true} />)
    unmount()

    const addCount = addSpy.mock.calls.filter(([e]) => e === 'mousemove').length
    const removeCount = removeSpy.mock.calls.filter(
      ([e]) => e === 'mousemove'
    ).length
    expect(addCount).toBe(removeCount)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('updates dot position on mousemove when editing', () => {
    render(<MovingDot editing={true} />)
    act(() => {
      fireEvent(
        document,
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 120,
          clientY: 80,
        })
      )
    })
    const dot = screen.getByTestId('moving-dot')
    expect(dot).toHaveStyle({ top: '75px', left: '115px' })
  })
})
