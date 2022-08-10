import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  ScheduleCommandForm,
  ScheduleCommandFormProps,
  ScheduleCommandFormValues,
} from './ScheduleCommandForm'

const props: ScheduleCommandFormProps = {
  vehicleName: 'Brizo',
  command: 'configSet CTD_Seabird.loadAtStartup 1 bool persist',
  onSubmit: async (values: ScheduleCommandFormValues) => {
    console.log(values)
    return undefined
  },
}

test('should render command', () => {
  render(<ScheduleCommandForm {...props} />)

  expect(screen.getByText(props.command)).toBeInTheDocument()
})

test('should render vehicle name', () => {
  render(<ScheduleCommandForm {...props} />)

  expect(screen.getByText(props.vehicleName)).toBeInTheDocument()
})

test('should check radio buttons', () => {
  render(<ScheduleCommandForm {...props} />)
  const asapButton = screen.getByRole('radio', { name: 'ASAP' })
  expect(asapButton).not.toBeChecked()

  fireEvent.click(asapButton)
  expect(asapButton).toBeChecked()
})

test('should render DateField when For specific time is selected', () => {
  render(<ScheduleCommandForm {...props} />)
  const customButton = screen.getByRole('radio', { name: 'For specific time' })
  expect(customButton).toBeInTheDocument()
  expect(customButton).not.toBeChecked()
  expect(screen.queryByLabelText('date picker')).not.toBeInTheDocument()

  fireEvent.click(customButton)
  expect(customButton).toBeChecked()
  expect(screen.getByLabelText('date picker')).toBeInTheDocument()
})
