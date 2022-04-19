import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleCommsCell, VehicleCommsCellProps } from './VehicleCommsCell'

const props: VehicleCommsCellProps = {
  icon: {} as any,
  headline: 'example',
  host: 'example',
  lastPing: 'example',
  nextComms: 'example',
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<VehicleCommsCell {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<VehicleCommsCell>Click Here</VehicleCommsCell>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
