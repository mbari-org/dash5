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

test('Repeat checkbox is hidden for ASAP and disabled until a time is entered', async () => {
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

  // Checkbox not visible on ASAP
  expect(
    screen.queryByRole('checkbox', { name: 'Repeat' })
  ).not.toBeInTheDocument()

  // Switch to specific time — checkbox appears; days input not yet shown
  await user.click(screen.getByText('For specific time:'))
  const repeat = screen.getByRole('checkbox', { name: 'Repeat' })
  expect(repeat).not.toBeChecked()
  expect(
    screen.queryByRole('spinbutton', { name: 'Repeat days' })
  ).not.toBeInTheDocument()
})

test('Repeat checkbox enables days input and shows hint when a time is pre-set', async () => {
  const user = userEvent.setup()
  render(
    <ScheduleProvider
      initialState={{
        scheduleMethod: 'time',
        specifiedTime: '2026-10-12T09:00:00.000Z',
      }}
    >
      <ScheduleStep
        vehicleName="Pontus"
        commandText="failc"
        commandDescriptor="command"
      />
    </ScheduleProvider>
  )

  const repeat = screen.getByRole('checkbox', { name: 'Repeat' })

  // Days input not visible until Repeat is checked
  expect(repeat).not.toBeChecked()
  expect(
    screen.queryByRole('spinbutton', { name: 'Repeat days' })
  ).not.toBeInTheDocument()

  await user.click(repeat)
  expect(repeat).toBeChecked()
  const days = screen.getByRole('spinbutton', { name: 'Repeat days' })
  expect(days).toBeEnabled()
  expect(days).toHaveValue(2)

  // Hint text appears with correct wording
  expect(
    screen.getByText(/Runs once daily on this date\/time then repeats/i)
  ).toBeInTheDocument()
  expect(screen.getByText(/\+1 day/i)).toBeInTheDocument()
  expect(screen.getByText(/Max 30 days/i)).toBeInTheDocument()
})
