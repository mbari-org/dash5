import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IconToggle } from './IconToggle'

jest.useFakeTimers()

test('renders with correct aria-label when toggled off', () => {
  render(
    <IconToggle
      iconLeft={<span>Left Icon</span>}
      iconRight={<span>Right Icon</span>}
      isToggled={false}
      onToggle={jest.fn()}
      ariaLabelRight="Toggled On"
      ariaLabelLeft="Toggled Off"
    />
  )
  expect(screen.getByRole('button')).toHaveAttribute(
    'aria-label',
    'Toggled Off'
  )
})

test('renders with correct aria-label when toggled on', () => {
  render(
    <IconToggle
      iconLeft={<span>Left Icon</span>}
      iconRight={<span>Right Icon</span>}
      isToggled={true}
      onToggle={jest.fn()}
      ariaLabelRight="Toggled On"
      ariaLabelLeft="Toggled Off"
    />
  )
  expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Toggled On')
})

test('calls onToggle with inverted value on click', () => {
  const onToggleMock = jest.fn()
  render(
    <IconToggle
      iconLeft={<span>Left Icon</span>}
      iconRight={<span>Right Icon</span>}
      isToggled={false}
      onToggle={onToggleMock}
    />
  )
  fireEvent.click(screen.getByRole('button'))
  expect(onToggleMock).toHaveBeenCalledWith(true)
})
