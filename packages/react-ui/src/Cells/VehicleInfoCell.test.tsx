import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'
import { VehicleInfoCell } from './VehicleInfoCell'

test('should render the component with plugged in state', async () => {
  expect(() => render(<VehicleInfoCell isPluggedIn={true} />)).not.toThrow()
})

test('should display plugged in state when isPluggedIn is true', async () => {
  render(<VehicleInfoCell isPluggedIn={true} />)

  expect(screen.getByText('Vehicle is docked')).toBeInTheDocument()
  expect(screen.getByText('Plugged in')).toBeInTheDocument()
  expect(screen.queryByText(/Last comms over sat/i)).not.toBeInTheDocument()
})

test('should display surfaced state when isReachable is true', async () => {
  render(<VehicleInfoCell isReachable={true} />)

  expect(screen.getByText('Likely surfaced')).toBeInTheDocument()
  expect(screen.getByText('Last comms over satellite')).toBeInTheDocument()
})

test('should display underwater state when isReachable is false', async () => {
  render(<VehicleInfoCell isReachable={false} />)

  expect(screen.getByText('Likely underwater')).toBeInTheDocument()
  expect(screen.getByText('Last comms over satellite')).toBeInTheDocument()
})

test('should display last sat comms time when provided and not plugged in', async () => {
  const lastSatCommsTime = DateTime.now().minus({ hours: 1 })
  render(
    <VehicleInfoCell isPluggedIn={false} lastSatCommsTime={lastSatCommsTime} />
  )

  expect(screen.getByText(/Last comms over sat:/i)).toBeInTheDocument()
})

test('should not display last sat comms time when plugged in', async () => {
  const lastSatCommsTime = DateTime.now().minus({ hours: 1 })
  render(
    <VehicleInfoCell isPluggedIn={true} lastSatCommsTime={lastSatCommsTime} />
  )

  expect(screen.queryByText(/Last comms over sat:/i)).not.toBeInTheDocument()
})

test('should display estimate when nextCommsTime is provided and not plugged in', async () => {
  const nextCommsTime = DateTime.now().plus({ minutes: 30 })
  render(<VehicleInfoCell isPluggedIn={false} nextCommsTime={nextCommsTime} />)

  expect(screen.queryByText(/Est\. to surface/i)).toBeInTheDocument()
})

test('should not display estimate when plugged in', async () => {
  const nextCommsTime = DateTime.now().plus({ minutes: 30 })
  render(<VehicleInfoCell isPluggedIn={true} nextCommsTime={nextCommsTime} />)

  expect(screen.queryByText(/Est\. to surface/i)).not.toBeInTheDocument()
})

test('should display full information when all props are provided', async () => {
  const lastSatCommsTime = DateTime.now().minus({ hours: 1 })
  const nextCommsTime = DateTime.now().plus({ minutes: 25 })

  render(
    <VehicleInfoCell
      isReachable={true}
      lastSatCommsTime={lastSatCommsTime}
      nextCommsTime={nextCommsTime}
    />
  )

  expect(screen.getByText('Likely surfaced')).toBeInTheDocument()
  expect(screen.getByText('Last comms over satellite')).toBeInTheDocument()
  expect(screen.getByText(/Last comms over sat:/i)).toBeInTheDocument()
  expect(screen.queryByText(/Est\. to surface/i)).toBeInTheDocument()
})

test('should display last plugged in time when provided and plugged in', async () => {
  const lastPluggedInTime = DateTime.now().minus({ hours: 2 })
  render(
    <VehicleInfoCell isPluggedIn={true} lastPluggedInTime={lastPluggedInTime} />
  )

  expect(screen.getByText('Vehicle is docked')).toBeInTheDocument()
  expect(screen.getByText('Plugged in')).toBeInTheDocument()
  expect(screen.queryByText(/Last plugged in/i)).toBeInTheDocument()
  expect(screen.queryByText(/Last comms over sat:/i)).not.toBeInTheDocument()
})

test('should not display last plugged in time when not plugged in', async () => {
  const lastPluggedInTime = DateTime.now().minus({ hours: 2 })
  render(
    <VehicleInfoCell
      isPluggedIn={false}
      lastPluggedInTime={lastPluggedInTime}
    />
  )

  expect(screen.queryByText(/Last plugged in/i)).not.toBeInTheDocument()
})
