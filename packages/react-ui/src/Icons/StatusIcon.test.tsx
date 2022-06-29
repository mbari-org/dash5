import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StatusIcon, StatusIconProps } from './StatusIcon'

const props: StatusIconProps = {}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<StatusIcon {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<StatusIcon>Click Here</StatusIcon>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
