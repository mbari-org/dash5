import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RecoveredPill } from './RecoveredPill'

test('should render without throwing', () => {
  expect(() => render(<RecoveredPill />)).not.toThrow()
})

test('should render "Recovered" when no recoveredAt is provided', () => {
  render(<RecoveredPill />)
  expect(screen.getByText('Recovered')).toBeInTheDocument()
})

test('should render "Recovered" with the timestamp when recoveredAt is provided', () => {
  render(<RecoveredPill recoveredAt="2h ago" />)
  expect(screen.getByText('Recovered 2h ago')).toBeInTheDocument()
})

test('should apply the className passed in', () => {
  render(<RecoveredPill className="test-class" />)
  expect(screen.getByText('Recovered')).toHaveClass('test-class')
})
