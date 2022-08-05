import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ScheduleCell, ScheduleCellProps } from './ScheduleCell'

const props: ScheduleCellProps = {
  status: 'pending',
  label: 'scheduled event',
  ariaLabel: 'cell container',
  secondary: 'breakfast of champions',
  name: 'Kurt Vonnegut',
  description: 'breakfast with Kilgore Trout',
  onSelect: () => {
    console.log('event fired')
  },
  onSelectMore: () => {
    console.log('event fired')
  },
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

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-violet-100')
})

test('should have orange background when paused', async () => {
  render(<ScheduleCell {...props} status={'paused'} />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-orange-100')
})

test('should have white background when scheduled', async () => {
  render(<ScheduleCell {...props} />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-white')
})

test('should have teal label when completed', async () => {
  render(<ScheduleCell {...props} status={'completed'} />)

  expect(screen.getByText(props.label)).toHaveClass('text-teal-600')
})

test('should have orange label when paused', async () => {
  render(<ScheduleCell {...props} status={'paused'} />)

  expect(screen.getByText(props.label)).toHaveClass('text-orange-400')
})
