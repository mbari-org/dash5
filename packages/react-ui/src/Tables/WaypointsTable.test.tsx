import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WaypointsTable, WaypointsTableProps } from './WaypointsTable'

const props: WaypointsTableProps = {
  waypoints: Array(5).fill({
    options: [
      { id: '1', name: '25.0000° N, 71.0000° W' },
      { id: '2', name: 'test option' },
    ],
  }),
  onSelectOption: (id) => {
    console.log(id)
  },
  onLocation: () => {
    console.log('on location button clicked')
  },
}

test('should render the component', async () => {
  expect(() => render(<WaypointsTable {...props} />)).not.toThrow()
})

test('should display the waypoint title', async () => {
  render(<WaypointsTable {...props} />)
  expect(screen.queryByText(/Lat1\/Lon1/i)).toBeInTheDocument()
})

test('should display the waypoint description', async () => {
  render(<WaypointsTable {...props} />)
  expect(screen.queryByText(/Latitude of 1st waypoint./i)).toBeInTheDocument()
})

test('should display the numbered waypoint map marker icon', async () => {
  render(<WaypointsTable {...props} />)
  expect(
    screen.queryByLabelText(/Number 1 map marker icon/i)
  ).toBeInTheDocument()
})
