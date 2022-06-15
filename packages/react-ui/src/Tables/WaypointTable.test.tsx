import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WaypointTable, WaypointTableProps } from './WaypointTable'

const props: WaypointTableProps = {
  waypoints: Array(5).fill({
    id: Math.floor(Math.random() * 100),
  }),
  stations: [
    { name: 'C1', lat: 36.797, long: -121.847 },
    { name: 'C2', lat: 46.797, long: -141.847 },
  ],
  onFocusWaypoint: (index) => {
    console.log(index)
  },
}

test('should render the component', async () => {
  expect(() => render(<WaypointTable {...props} />)).not.toThrow()
})

test('should display the waypoint title', async () => {
  render(<WaypointTable {...props} />)
  expect(screen.queryByText(/Lat1\/Lon1/i)).toBeInTheDocument()
})

test('should display the waypoint description', async () => {
  render(<WaypointTable {...props} />)
  expect(screen.queryByText(/Latitude of 1st waypoint./i)).toBeInTheDocument()
})

test('should display the numbered waypoint map marker icon', async () => {
  render(<WaypointTable {...props} />)
  expect(
    screen.queryByLabelText(/Number 1 map marker icon/i)
  ).toBeInTheDocument()
})

test('should display the map marker icon with opacity 60 when not in focus mode', async () => {
  render(<WaypointTable {...props} />)
  expect(screen.queryAllByTestId(/map marker icon/i)[0]).toHaveClass(
    'opacity-60'
  )
})

test('should display alternative focus mode view if focusWaypointIndex prop is provided', async () => {
  render(<WaypointTable {...props} focusWaypointIndex={1} />)
  expect(
    screen.queryByText(/Place the location pin to set Lat2\/Lon2/i)
  ).toBeInTheDocument()
  expect(screen.queryByText(/Lat1/i)).not.toBeInTheDocument()
})

test('should display the numbered waypoint map marker icon in purple when in focus mode', async () => {
  render(<WaypointTable {...props} focusWaypointIndex={1} />)
  expect(screen.queryByTestId(/map marker icon/i)).toHaveClass(
    'text-purple-700'
  )
})
