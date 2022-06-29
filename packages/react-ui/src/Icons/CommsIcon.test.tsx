import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommsIcon, CommsIconProps } from './CommsIcon'

const props: CommsIconProps = {}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<CommsIcon {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<CommsIcon>Click Here</CommsIcon>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
