import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  WaypointSummaryView,
  WaypointSummaryViewProps,
} from './WaypointSummaryView'

const props: WaypointSummaryViewProps = {
  waypoints: [
    { name: 'C1', lat: 36.797, long: 127.847 },
    { name: 'M1', lat: 36.797, long: 127.847 },
    { name: 'Custom', lat: 36.797, long: 127.847 },
  ],
  vehicle: 'Brizo',
  mission: 'sci2',
  estimatedDistance: '7.2 km',
  estimatedBottomDepth: '100-180 m',
  estimatedDuration: '6hrs',
}

test('should render the component', async () => {
  expect(() => render(<WaypointSummaryView {...props} />)).not.toThrow()
})

test('should display the set up header', async () => {
  render(<WaypointSummaryView {...props} />)

  expect(screen.queryByText(/Brizo/gi)).toBeInTheDocument()
  expect(screen.queryByText(props.mission)).toBeInTheDocument()
})

test('should display the summary header with the correct number of waypoints', async () => {
  render(<WaypointSummaryView {...props} />)

  expect(screen.queryByText('Summary of waypoints (3)')).toBeInTheDocument()
})
