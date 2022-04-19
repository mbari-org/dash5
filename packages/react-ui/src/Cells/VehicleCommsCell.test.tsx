import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleCommsCell, VehicleCommsCellProps } from './VehicleCommsCell'

const props: VehicleCommsCellProps = {
  icon: <div>icon goes here</div>,
  headline: 'test headline',
  host: 'test host',
  lastPing: 'test last ping',
}

test('should render the component', async () => {
  expect(() => render(<VehicleCommsCell {...props} />)).not.toThrow()
})

test('should display headline', async () => {
  render(<VehicleCommsCell {...props} />)
  expect(screen.getByText(props.headline)).toBeInTheDocument()
})

test('should display host text when provided', async () => {
  render(<VehicleCommsCell {...props} />)
  expect(screen.getByText(/test host/i)).toBeInTheDocument()
})

test('should not display next comms when it is not provided', async () => {
  render(<VehicleCommsCell {...props} />)
  expect(screen.queryByText(/next comms/i)).not.toBeInTheDocument()
})
