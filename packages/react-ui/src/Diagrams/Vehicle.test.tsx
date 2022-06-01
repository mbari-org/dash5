import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Vehicle, VehicleProps } from './Vehicle'

const props: VehicleProps = {
  name: 'example',
  mission: 'example',
  scheduled: 'example',
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<Vehicle {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<Vehicle>Click Here</Vehicle>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
