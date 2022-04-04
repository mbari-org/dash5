import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ScheduleCell, ScheduleCellProps } from './ScheduleCell'

const props: ScheduleCellProps = {
  status: 'scheduled',
  label: 'scheduled event',
  ariaLabel: 'cell container',
  secondary: 'breakfast of champions',
  name: 'Kurt Vonnegut',
  description: 'breakfast with Kilgore Trout',
}

test('should render the label', async () => {
  render(<ScheduleCell {...props} />)

  expect(screen.getByText(props.label)).toBeInTheDocument()
})

test('should render the appropriate icon', async () => {
  render(<ScheduleCell {...props} status={'running'} />)

  expect(screen.getByTitle(/running/i)).toBeInTheDocument()
})

test('should have blue background when running', async () => {
  render(<ScheduleCell {...props} status={'running'} />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-indigo-400')
})

test('should have orange background when paused', async () => {
  render(<ScheduleCell {...props} status={'paused'} />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-red-600')
})
