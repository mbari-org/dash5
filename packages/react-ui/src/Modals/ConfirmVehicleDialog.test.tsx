import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  ConfirmVehicleDialog,
  ConfirmVehicleDialogProps,
} from './ConfirmVehicleDialog'

const props: ConfirmVehicleDialogProps = {
  vehicle: 'Brizo',
  vehicleList: ['Brizo', 'Tethys', 'GupB'],
  onCancel: () => console.log('cancel'),
  onConfirm: () => console.log('confirm'),
  onSubmit: (vehicle) => console.log(vehicle),
}

test('should render title with vehicle name', () => {
  render(<ConfirmVehicleDialog {...props} command={'configSet'} />)

  expect(
    screen.queryByText(/this command should be scheduled for/i)
  ).toBeInTheDocument()
  expect(screen.queryByTestId(/currentVehicle/i)).toHaveTextContent(
    props.vehicle
  )
})

test('should render vehicle name in title in teal', () => {
  render(<ConfirmVehicleDialog {...props} command={'configSet'} />)

  expect(screen.queryByTestId(/currentVehicle/i)).toHaveClass('text-teal-500')
})

test('should render command name when provided', () => {
  render(<ConfirmVehicleDialog {...props} command={'configSet'} />)

  expect(
    screen.queryByText(/yes, brizo should do configSet/i)
  ).toBeInTheDocument()
})

test('should render mission name when provided', () => {
  render(<ConfirmVehicleDialog {...props} mission={'sci2.xml'} />)

  expect(
    screen.queryByText(/yes, brizo should do sci2.xml/i)
  ).toBeInTheDocument()
})

test('should check radio buttons', async () => {
  render(<ConfirmVehicleDialog {...props} command={'configSet'} />)

  const yesButton = screen.getByTestId('default')
  const noButton = screen.getByTestId('selected')

  expect(yesButton).toBeChecked()

  fireEvent.click(noButton)

  await waitFor(() => expect(noButton).toBeChecked())
})

test('should disable Confirm button when No is checked and an alternate vehicle has not been selected', async () => {
  render(<ConfirmVehicleDialog {...props} command={'configSet'} />)

  const noButton = screen.getByTestId('selected')
  fireEvent.click(noButton)

  await waitFor(() => expect(noButton).toBeChecked())
  expect(screen.getByText(/confirm/i)).toBeDisabled()
})
