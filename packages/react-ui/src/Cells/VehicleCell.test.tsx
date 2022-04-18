import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleCell, VehicleCellProps } from './VehicleCell'

const props: VehicleCellProps = {
  icon: {} as any,
  headline: {} as any,
  lastPosition: 'example',
  lastSatellite: 'example',
  lastCell: 'example',
  lastKnownGPS: 'example',
  lastCommunication: 'example',
}

test.todo('should have tests')

// test('should render the component', async () => {
//   expect(() => render(<VehicleCell {...props} />)).not.toThrow()
// })

// test('should render child content', async () => {
//   render(<VehicleCell>Click Here</VehicleCell>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
