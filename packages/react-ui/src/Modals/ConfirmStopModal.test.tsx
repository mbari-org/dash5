import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfirmStopModal, ConfirmStopModalProps } from './ConfirmStopModal'

const args: ConfirmStopModalProps = {
  open: true,
  onClose: () => {
    console.log('event fired')
  },
  onCancel: () => {
    console.log('event fired')
  },
  onConfirmValue: () => {
    console.log('event fired')
  },
  vehicleName: 'Brizo',
  vehicleUrl: '/vehicles/brizo',
  title: '',
}

test('should render the vehicle name', async () => {
  render(<ConfirmStopModal {...args} />)
  expect(screen.getByText(/Brizo/i)).toBeInTheDocument()
})

test('should not render the vehicle name if blank', async () => {
  render(<ConfirmStopModal {...args} vehicleName={undefined} />)
  expect(screen.queryByText(/Brizo/i)).not.toBeInTheDocument()
})

test('should throw an error if the default submit handler is used', async () => {
  expect(() =>
    render(
      <ConfirmStopModal
        {...args}
        onConfirm={() => {
          console.log('event fired')
        }}
      />
    )
  ).toThrow(
    "ConfirmStopModal does not support default 'onConfirm' method. Use 'onConfirmValue' instead."
  )
})

test('should not allow the user to confirm until a value has been selected', async () => {
  render(<ConfirmStopModal {...args} />)
  expect(screen.getByText(/Confirm/i)).toHaveClass('cursor-not-allowed')
  fireEvent.click(screen.getByLabelText(/stop the mission/i))
  expect(screen.getByText(/Confirm/i)).not.toHaveClass('cursor-not-allowed')
})
