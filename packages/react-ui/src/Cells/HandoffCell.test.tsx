import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HandoffCell, HandoffCellProps } from './HandoffCell'

const props: HandoffCellProps = {
  date: '2022-07-01T18:24:22.321Z',
  note: 'This is a test note.',
  pilot: 'Shannon Johnson',
}

test('should render the component', async () => {
  expect(() => render(<HandoffCell {...props} />)).not.toThrow()
})

test('should render the note text', async () => {
  render(<HandoffCell {...props} />)
  expect(screen.getByText(/This is a test note./i)).toBeInTheDocument()
})

test('should render the pilot name text', async () => {
  render(<HandoffCell {...props} />)
  expect(screen.getByText(/Shannon Johnson/i)).toBeInTheDocument()
})

test('should render the PIC container if in PIC mode', async () => {
  render(<HandoffCell {...props} pic />)
  expect(screen.getByTestId(/pic/i)).toBeInTheDocument()
})

test('should NOT render the PIC container if NOT in PIC mode', async () => {
  render(<HandoffCell {...props} />)
  expect(screen.queryByTestId(/pic/i)).not.toBeInTheDocument()
})

test('should have a strong border if unread', async () => {
  render(<HandoffCell {...props} unread />)
  expect(screen.getByTestId(/handoffCell/i)).toHaveClass('border-l-4')
})

test('should NOT have a strong border if NOT unread', async () => {
  render(<HandoffCell {...props} />)
  expect(screen.getByTestId(/handoffCell/i)).not.toHaveClass('border-l-4')
})
