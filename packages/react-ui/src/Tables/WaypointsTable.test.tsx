import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WaypointsTable, WaypointsTableProps } from './WaypointsTable'

const props: WaypointsTableProps = {}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<WaypointsTable {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<WaypointsTable>Click Here</WaypointsTable>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
