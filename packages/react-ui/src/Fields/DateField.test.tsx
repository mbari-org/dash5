import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import LuxonUtils from '@date-io/luxon'
import { DateField } from './DateField'

const renderWithProvider = (ui: React.ReactElement) =>
  render(
    <MuiPickersUtilsProvider utils={LuxonUtils}>{ui}</MuiPickersUtilsProvider>
  )

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

test('Done button closes picker and allows it to reopen', async () => {
  const { getByPlaceholderText, getByText, queryByText } = renderWithProvider(
    <DateField name="launchDate" placeholder="Select a date" />
  )

  // Open the picker
  await act(async () => {
    fireEvent.focus(getByPlaceholderText('Select a date'))
    await new Promise((r) => setTimeout(r, 100))
  })
  expect(getByText('Done')).toBeInTheDocument()

  // Click Done — picker should close
  await act(async () => {
    fireEvent.click(getByText('Done'))
    await new Promise((r) => setTimeout(r, 100))
  })
  expect(queryByText('Done')).not.toBeInTheDocument()

  // Focus again — picker should reopen
  await act(async () => {
    fireEvent.focus(getByPlaceholderText('Select a date'))
    await new Promise((r) => setTimeout(r, 100))
  })
  expect(getByText('Done')).toBeInTheDocument()
})
