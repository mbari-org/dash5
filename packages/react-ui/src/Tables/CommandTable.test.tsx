import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandTable, CommandTableProps } from './CommandTable'

const props: CommandTableProps = {}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<CommandTable {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<CommandTable>Click Here</CommandTable>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
