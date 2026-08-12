import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DateTime } from 'luxon'
import { VehicleInfoCell } from './VehicleInfoCell'

test('displays plugged in state', async () => {
  render(<VehicleInfoCell isPluggedIn={true} />)

  expect(screen.getByText('Vehicle is docked')).toBeInTheDocument()
  expect(screen.getByText('Plugged in')).toBeInTheDocument()
  expect(screen.queryByText(/Last comms over sat/i)).not.toBeInTheDocument()
})

test('displays surfaced state', async () => {
  render(<VehicleInfoCell isReachable={true} />)

  expect(screen.getByText('Likely surfaced')).toBeInTheDocument()
  expect(screen.getByText('Last comms over satellite')).toBeInTheDocument()
})

test('displays underwater state', async () => {
  render(<VehicleInfoCell isReachable={false} />)

  expect(screen.getByText('Likely underwater')).toBeInTheDocument()
})

test('displays last sat comms time when not plugged in', async () => {
  render(
    <VehicleInfoCell
      isPluggedIn={false}
      lastSatCommsTime={DateTime.now().minus({ hours: 1 })}
    />
  )

  expect(screen.getByText(/Last comms over sat:/i)).toBeInTheDocument()
})

test('hides last sat comms time when plugged in', async () => {
  render(
    <VehicleInfoCell
      isPluggedIn={true}
      lastSatCommsTime={DateTime.now().minus({ hours: 1 })}
    />
  )

  expect(screen.queryByText(/Last comms over sat:/i)).not.toBeInTheDocument()
})

test('displays est. to surface when nextCommsTime provided and not plugged in', async () => {
  render(
    <VehicleInfoCell
      isPluggedIn={false}
      nextCommsTime={DateTime.now().plus({ minutes: 30 })}
    />
  )

  expect(screen.getByText(/Est\. to surface/i)).toBeInTheDocument()
})

test('hides est. to surface when plugged in', async () => {
  render(
    <VehicleInfoCell
      isPluggedIn={true}
      nextCommsTime={DateTime.now().plus({ minutes: 30 })}
    />
  )

  expect(screen.queryByText(/Est\. to surface/i)).not.toBeInTheDocument()
})

test('displays est. time till next vehicle surface when nextCommsText provided and not plugged in', async () => {
  render(<VehicleInfoCell isPluggedIn={false} nextCommsText="in 2h 30m" />)

  expect(
    screen.getByText(/Est\. time till next vehicle surface: in 2h 30m/i)
  ).toBeInTheDocument()
})

test('hides est. time till next vehicle surface when plugged in', async () => {
  render(<VehicleInfoCell isPluggedIn={true} nextCommsText="in 2h 30m" />)

  expect(
    screen.queryByText(/Est\. time till next vehicle surface:/i)
  ).not.toBeInTheDocument()
})

test('displays last plugged in time when plugged in', async () => {
  render(
    <VehicleInfoCell
      isPluggedIn={true}
      lastPluggedInTime={DateTime.now().minus({ hours: 2 })}
    />
  )

  expect(screen.getByText(/Last plugged in/i)).toBeInTheDocument()
})

test('hides last plugged in time when not plugged in', async () => {
  render(
    <VehicleInfoCell
      isPluggedIn={false}
      lastPluggedInTime={DateTime.now().minus({ hours: 2 })}
    />
  )

  expect(screen.queryByText(/Last plugged in/i)).not.toBeInTheDocument()
})
