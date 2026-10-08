import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ScheduleStep, scheduleRepeatToSend } from './ScheduleStep'
import { ScheduleProvider } from './hooks/useSchedule'

test('scheduleRepeatToSend is only a dated repeat between 2 and 30 days', () => {
  expect(scheduleRepeatToSend('time', true, 15)).toBe(15)
  expect(scheduleRepeatToSend('time', false, 15)).toBeUndefined()
  expect(scheduleRepeatToSend('ASAP', true, 15)).toBeUndefined()
  expect(scheduleRepeatToSend('end', true, 15)).toBeUndefined()
  expect(scheduleRepeatToSend('time', true, 1)).toBeUndefined()
  expect(scheduleRepeatToSend('time', true, 31)).toBeUndefined()
})

test('Repeat appears when scheduling for a specific time', async () => {
  const user = userEvent.setup()
  render(
    <ScheduleProvider>
      <ScheduleStep
        vehicleName="Pontus"
        commandText="failc"
        commandDescriptor="command"
      />
    </ScheduleProvider>
  )

  expect(
    screen.queryByRole('checkbox', { name: 'Repeat' })
  ).not.toBeInTheDocument()
  await user.click(screen.getByText('For specific time:'))

  const repeat = screen.getByRole('checkbox', { name: 'Repeat' })
  const days = screen.getByRole('spinbutton', { name: 'Repeat days' })
  expect(repeat).not.toBeChecked()
  expect(days).toBeDisabled()

  await user.click(repeat)
  expect(days).toBeEnabled()
  expect(days).toHaveValue(2)
  expect(screen.getByText(/the next day/)).toBeInTheDocument()
  expect(screen.getByText(/30 days maximum/)).toBeInTheDocument()
})
