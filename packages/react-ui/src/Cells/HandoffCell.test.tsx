import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HandoffCell, HandoffCellProps } from './HandoffCell'

const props: HandoffCellProps = {
  date: 'example',
  note: 'example',
  pilot: 'example',
  warning: true,
  pic: true,
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<HandoffCell {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<HandoffCell>Click Here</HandoffCell>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
