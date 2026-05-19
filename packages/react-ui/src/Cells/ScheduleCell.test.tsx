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
  onMoreClick: () => {
    console.log('event fired')
  },
  eventId: 123,
  commandType: 'mission',
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
  render(
    <ScheduleCell {...props} status={'running'} scheduleStatus="running" />
  )

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-blue-50')
})

test('should have blue background when pending but the schedule is running', async () => {
  render(<ScheduleCell {...props} scheduleStatus="running" />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-blue-50')
})

test('should have white background when paused', async () => {
  render(<ScheduleCell {...props} status={'paused'} scheduleStatus="paused" />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-white')
})

test('should have white background when pending and the schedule is paused', async () => {
  render(<ScheduleCell {...props} scheduleStatus="paused" />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-white')
})

test('should have white background when scheduled', async () => {
  render(<ScheduleCell {...props} />)

  expect(screen.getByLabelText(/cell container/i)).toHaveClass('bg-white')
})

test('should have teal label when completed', async () => {
  render(<ScheduleCell {...props} status={'completed'} />)

  expect(screen.getByText(props.label).closest('li')).toHaveClass(
    'text-teal-600'
  )
})

test('should have teal label when paused', async () => {
  render(<ScheduleCell {...props} status={'paused'} scheduleStatus="paused" />)

  expect(screen.getByText(props.label).closest('li')).toHaveClass(
    'text-teal-600'
  )
})

test('should have teal label when pending and the schedule is paused', async () => {
  render(<ScheduleCell {...props} scheduleStatus="paused" />)

  expect(screen.getByText(props.label).closest('li')).toHaveClass(
    'text-teal-600'
  )
})

test('should render secondary text when secondary prop is provided', () => {
  render(<ScheduleCell {...props} secondary="breakfast of champions" />)

  expect(screen.getByText('breakfast of champions')).toBeInTheDocument()
})

test('should render the timeout icon with its tooltip when status is timeout', () => {
  render(
    <ScheduleCell {...props} status={'timeout'} statusTooltip="Timed out" />
  )

  expect(screen.getByTitle('Timed out')).toBeInTheDocument()
  expect(screen.getByLabelText('timeout warning icon')).toBeInTheDocument()
})

test('timeout icon span is dimmed when schedule is not running', () => {
  render(
    <ScheduleCell {...props} status={'timeout'} scheduleStatus={undefined} />
  )

  // The outer span (title wrapper) gets opacity-60 for non-running schedules;
  // the inner span is the icon's own wrapper, so use parentElement to reach the outer one.
  expect(
    screen.getByLabelText('timeout warning icon').parentElement
  ).toHaveClass('opacity-60')
})

test('timeout icon span is not dimmed when schedule is running', () => {
  render(
    <ScheduleCell
      {...props}
      status={'timeout'}
      scheduleStatus="running"
      statusTooltip="Timed out"
    />
  )

  expect(screen.getByTitle('Timed out')).not.toHaveClass('opacity-60')
})

test('should not render an empty secondary row when secondary is undefined', () => {
  // Previously ScheduleCell always rendered the secondary <li> even when
  // secondary was undefined, leaving an empty subtitle row for non-mission
  // commands. This guards against regressions.
  // Base props include secondary='breakfast of champions'; override to undefined.
  render(<ScheduleCell {...props} secondary={undefined} />)

  // The label still renders...
  expect(screen.getByText(props.label)).toBeInTheDocument()
  // ...but the secondary text from the base props must not appear.
  expect(screen.queryByText('breakfast of champions')).not.toBeInTheDocument()
  // ...and there must be no italic subtitle <li> in the DOM at all.
  const italicLis = document.querySelectorAll('li.italic')
  expect(italicLis).toHaveLength(0)
})

test('should not render a name row when name is empty string', () => {
  // Default mission rows pass name="" so no operator attribution is shown.
  // This guards against the conditional rendering regressing back to an
  // empty <li> that creates a blank line in the schedule history list.
  const { container } = render(<ScheduleCell {...props} name="" />)

  expect(screen.getByText(props.label)).toBeInTheDocument()
  // Count <li> elements: label + secondary + description = 3 when name present,
  // label + secondary + description = 3 when name is omitted (no extra blank li).
  // More directly: no <li> in the name column should contain any text content,
  // and the total li count must be one fewer than when name is provided.
  const liCount = container.querySelectorAll('li').length
  const { container: fullContainer } = render(
    <ScheduleCell {...props} name="Kurt Vonnegut" />
  )
  const fullLiCount = fullContainer.querySelectorAll('li').length
  expect(liCount).toBeLessThan(fullLiCount)
})
