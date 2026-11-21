import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'
import { DateField } from './DateField'

jest.mock('@material-ui/pickers', () => ({
  Calendar: () => <div data-testid="mock-calendar" />,
  ClockView: () => <div data-testid="mock-clock" />,
}))

/** Opens the date picker by focusing the input and flushing the 0ms timer. */
const openPicker = async (input: HTMLElement) => {
  fireEvent.focus(input)
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
}

test('should render the placeholder value', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" />)
  expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument()
})

test('should indicate a disabled state', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" disabled />)
  expect(screen.getByPlaceholderText('Select a date')).toHaveClass(
    'cursor-not-allowed opacity-50'
  )
})

test('should not render the date picker by default', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" />)
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})

test('Cancel button is visible when picker is open', async () => {
  render(<DateField name="launchDate" placeholder="Select a date" />)
  await openPicker(screen.getByPlaceholderText('Select a date'))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  )
})

test('Cancel with no initial value calls onChange with empty string', async () => {
  const handleChange = jest.fn()
  render(
    <DateField
      name="launchDate"
      placeholder="Select a date"
      onChange={handleChange}
    />
  )
  await openPicker(screen.getByPlaceholderText('Select a date'))
  await waitFor(() => screen.getByRole('button', { name: 'Cancel' }))
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(handleChange).toHaveBeenCalledWith('')
})

test('Cancel with initial value restores the original date', async () => {
  const handleChange = jest.fn()
  const isoValue = '2026-08-24T10:00:00.000Z'
  render(
    <DateField name="launchDate" value={isoValue} onChange={handleChange} />
  )
  await openPicker(screen.getByRole('textbox'))
  await waitFor(() => screen.getByRole('button', { name: 'Cancel' }))
  handleChange.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(handleChange).toHaveBeenCalledTimes(1)
  // The returned ISO string represents the same UTC instant regardless of local offset
  const returned = handleChange.mock.calls[0][0] as string
  expect(DateTime.fromISO(returned).toUTC().toISO()).toBe(
    DateTime.fromISO(isoValue).toUTC().toISO()
  )
})
