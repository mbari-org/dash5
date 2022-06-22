import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ParameterTable, ParameterTableProps } from './ParameterTable'

const props: ParameterTableProps = {
  parameters: [],
  onVerifyValue: (value) => value,
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<ParameterTable {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<ParameterTable>Click Here</ParameterTable>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
