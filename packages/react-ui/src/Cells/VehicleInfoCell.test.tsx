import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleInfoCell, VehicleInfoCellProps } from './VehicleInfoCell'

const props: VehicleInfoCellProps = {
  icon: <div>icon goes here</div>,
  headline: 'test headline',
  subtitle: 'test subtitle',
  estimate: 'test estimate',
}

test('should render the component', async () => {
  expect(() => render(<VehicleInfoCell {...props} />)).not.toThrow()
})

test('should display the headline', async () => {
  render(<VehicleInfoCell {...props} />)

  expect(screen.getByText(props.headline)).toBeInTheDocument()
})

test('should display the subtitle', async () => {
  render(<VehicleInfoCell {...props} />)

  expect(screen.getByText(/test subtitle/i)).toBeInTheDocument()
})

test('should display the estimate text when provided', async () => {
  render(<VehicleInfoCell {...props} />)

  expect(screen.getByText(/test estimate/i)).toBeInTheDocument()
})

test('should display the last comms text when provided', async () => {
  render(<VehicleInfoCell {...props} lastCommsOverSat={'test comms'} />)

  expect(screen.queryByText(/Last comms over sat/i)).toBeInTheDocument()
})

test('should not display the last comms text when it is not provided', async () => {
  render(<VehicleInfoCell {...props} />)

  expect(screen.queryByText(/Last comms over sat/i)).not.toBeInTheDocument()
})
