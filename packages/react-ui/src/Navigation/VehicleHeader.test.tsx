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
  timeSpanSinceDeployment:
    DateTime.now().minus({ days: 3, hours: 4 }).toRelative() ?? undefined,
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

test('should render the Recovered pill when recovered is true', async () => {
  render(<VehicleHeader {...props} recovered={true} recoveredAt="2h ago" />)
  expect(screen.getByText(/recovered 2h ago/i)).toBeInTheDocument()
  expect(screen.queryByText(/began/i)).not.toBeInTheDocument()
})

test('should render the Recovered pill without timestamp when recoveredAt is not provided', async () => {
  render(<VehicleHeader {...props} recovered={true} />)
  expect(screen.getByText('Recovered')).toBeInTheDocument()
  expect(screen.queryByText(/began/i)).not.toBeInTheDocument()
})

test('should render "Deployed X ago" label for a past deployment', async () => {
  render(<VehicleHeader {...props} />)
  expect(screen.getByText(/Deployed/i)).toBeInTheDocument()
  expect(screen.getByText(/3 days ago/i)).toBeInTheDocument()
})

test('should render pre-launch label without testing timespan', async () => {
  const futureTimeSpan =
    DateTime.now().plus({ days: 2 }).toRelative() ?? undefined
  render(
    <VehicleHeader
      {...props}
      isFutureDeployment={true}
      timeSpanSinceDeployment={futureTimeSpan}
    />
  )
  expect(screen.getByText(/Launches/i)).toBeInTheDocument()
  expect(screen.queryByText(/Mission began/i)).not.toBeInTheDocument()
})

test('should render pre-launch label with testing timespan', async () => {
  const futureTimeSpan =
    DateTime.now().plus({ days: 2 }).toRelative() ?? undefined
  const testingTimeSpan =
    DateTime.now().minus({ hours: 6 }).toRelative() ?? undefined
  render(
    <VehicleHeader
      {...props}
      isFutureDeployment={true}
      timeSpanSinceDeployment={futureTimeSpan}
      missionTimeSpan={testingTimeSpan}
    />
  )
  expect(screen.getByText(/Pre-deployment filed/i)).toBeInTheDocument()
  expect(screen.getByText(/Launches/i)).toBeInTheDocument()
})
