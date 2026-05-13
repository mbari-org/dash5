import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReassignmentCell } from './ReassignmentCell'

describe('ReassignmentCell', () => {
  const defaultProps = {
    operators: [],
    currentUserName: 'Jane Doe',
    onSignIn: jest.fn(),
    onSignOut: jest.fn(),
    signInAriaLabel: 'Sign in as operator',
    signOutAriaLabel: 'Remove yourself as operator',
  }

  test('should render the component with default props', () => {
    expect(() => render(<ReassignmentCell {...defaultProps} />)).not.toThrow()
  })

  test('should display "No one" when operators array is empty', () => {
    render(<ReassignmentCell {...defaultProps} />)
    expect(screen.getByText('No one')).toBeInTheDocument()
  })

  test('should display the Join button when current user is not in the list', () => {
    render(<ReassignmentCell {...defaultProps} />)
    expect(screen.getByText('Join')).toBeInTheDocument()
  })

  const makeOp = (user: string) => ({ user, unixTime: Date.now() })

  test('should display operator names when operators are provided', () => {
    render(
      <ReassignmentCell
        {...defaultProps}
        operators={[makeOp('John Smith'), makeOp('Bob Johnson')]}
      />
    )

    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  test('should display current user with teal color when in the operators list', () => {
    render(
      <ReassignmentCell
        {...defaultProps}
        operators={[makeOp('John Smith'), makeOp('Jane Doe')]}
      />
    )

    const currentUserElement = screen.getByText('Jane Doe')
    expect(currentUserElement).toHaveClass('text-teal-500')
  })

  test('should show elapsed time for current user when showElapsed is true', () => {
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000
    const signInTime = Date.now() - TWO_HOURS_MS

    render(
      <ReassignmentCell
        {...defaultProps}
        operators={[{ user: 'Jane Doe', unixTime: signInTime }]}
        showElapsed
      />
    )

    expect(screen.getByText(/signed in 2h 0m/)).toBeInTheDocument()
  })

  test('should not show elapsed time when showElapsed is false', () => {
    const signInTime = Date.now() - 2 * 60 * 60 * 1000

    render(
      <ReassignmentCell
        {...defaultProps}
        operators={[{ user: 'Jane Doe', unixTime: signInTime }]}
        showElapsed={false}
      />
    )

    expect(screen.queryByText(/signed in/)).not.toBeInTheDocument()
  })

  test('should show elapsed time in minutes only when under one hour', () => {
    const FORTY_FIVE_MIN_MS = 45 * 60 * 1000
    const signInTime = Date.now() - FORTY_FIVE_MIN_MS

    render(
      <ReassignmentCell
        {...defaultProps}
        operators={[{ user: 'Jane Doe', unixTime: signInTime }]}
        showElapsed
      />
    )

    expect(screen.getByText(/signed in 45m/)).toBeInTheDocument()
  })
})
