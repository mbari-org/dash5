import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LaunchCommandDialog } from '../components/LaunchCommandDialog'

const onConfirmWithCommand = jest.fn()
const onConfirmNoCommand = jest.fn()
const onCancel = jest.fn()

const defaultProps = {
  event: 'launch' as const,
  onConfirmWithCommand,
  onConfirmNoCommand,
  onCancel,
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('renders Record Launch Event title for launch event', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  expect(screen.getByText('Record Launch Event')).toBeInTheDocument()
})

test('renders Record Recover Event title for recover event', () => {
  render(<LaunchCommandDialog {...defaultProps} event="recover" />)
  expect(screen.getByText('Record Recover Event')).toBeInTheDocument()
})

test('defaults to send with command selected', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  const commandRadio = screen.getByDisplayValue('command')
  expect(commandRadio).toBeChecked()
})

test('defaults command text to restart logs', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  expect(screen.getByLabelText(/command text/i)).toHaveValue('restart logs')
})

test('defaults via to cellsat', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  expect(screen.getByLabelText(/send via/i)).toHaveValue('cellsat')
})

test('defaults timeout to 5 minutes', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  expect(screen.getByLabelText(/timeout minutes/i)).toHaveValue(5)
})

test('submit is disabled when command text is empty', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  const commandInput = screen.getByLabelText(/command text/i)
  fireEvent.change(commandInput, { target: { value: '' } })
  expect(screen.getByText(/Record & Submit/i)).toBeDisabled()
})

test('submit is disabled when isSubmitting is true', () => {
  render(<LaunchCommandDialog {...defaultProps} isSubmitting />)
  expect(screen.getByText(/Record & Submit/i)).toBeDisabled()
})

test('calls onCancel when Cancel is clicked', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  fireEvent.click(screen.getByText('Cancel'))
  expect(onCancel).toHaveBeenCalledTimes(1)
})

test('calls onConfirmWithCommand with command, via, timeout on submit', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  fireEvent.click(screen.getByText(/Record & Submit/i))
  expect(onConfirmWithCommand).toHaveBeenCalledWith(
    'restart logs',
    'cellsat',
    5
  )
  expect(onConfirmNoCommand).not.toHaveBeenCalled()
})

test('calls onConfirmNoCommand when no command is selected', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  fireEvent.click(screen.getByDisplayValue('none'))
  fireEvent.click(screen.getByText(/Record & Submit/i))
  expect(onConfirmNoCommand).toHaveBeenCalledTimes(1)
  expect(onConfirmWithCommand).not.toHaveBeenCalled()
})

test('does not show timeout when sat only is selected', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  fireEvent.change(screen.getByLabelText(/send via/i), {
    target: { value: 'sat' },
  })
  expect(screen.queryByLabelText(/timeout minutes/i)).not.toBeInTheDocument()
})

test('calls onConfirmWithCommand without timeout when sat only is selected', () => {
  render(<LaunchCommandDialog {...defaultProps} />)
  fireEvent.change(screen.getByLabelText(/send via/i), {
    target: { value: 'sat' },
  })
  fireEvent.click(screen.getByText(/Record & Submit/i))
  expect(onConfirmWithCommand).toHaveBeenCalledWith(
    'restart logs',
    'sat',
    undefined
  )
})
