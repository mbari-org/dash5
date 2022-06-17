import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleHeader, VehicleHeaderProps } from './VehicleHeader'
import { DateTime } from 'luxon'

const props: VehicleHeaderProps = {
  name: 'Brizo',
  deployment: 'Brizo 7 Ecohab',
  color: '#00ff00',
  onToggle: () => undefined,
  open: true,
  deployedAt: DateTime.now().minus({ days: 3, hours: 4 }).toSeconds(),
}

test('should render the component', async () => {
  expect(() => render(<VehicleHeader {...props} />)).not.toThrow()
})

test('should render the vehicle and the deployment', async () => {
  render(<VehicleHeader {...props} />)
  expect(screen.getByText(/Brizo: Brizo 7 Ecohab/i)).toHaveTextContent(
    'Brizo: Brizo 7 Ecohab'
  )
})

test('should render the relative date is was deployed at', async () => {
  render(<VehicleHeader {...props} />)
  expect(screen.getByText(/3 days ago/i)).toHaveTextContent('3 days ago')
})

test('should render the color', async () => {
  render(<VehicleHeader {...props} />)
  expect(screen.getByTestId(/color/i)).toHaveAttribute(
    'style',
    'background-color: rgb(0, 255, 0);'
  )
})
