import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  WaypointSummaryView,
  WaypointSummaryViewProps,
} from './WaypointSummaryView'

const props: WaypointSummaryViewProps = {
  waypoints: [],
  estimatedDuration: 'example',
  estimatedDistance: 'example',
  estimatedBottomDepth: 'example',
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<WaypointSummaryView {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<WaypointSummaryView>Click Here</WaypointSummaryView>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
