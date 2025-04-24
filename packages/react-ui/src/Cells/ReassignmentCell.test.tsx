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

  test('should display operator names when operators are provided', () => {
    render(
      <ReassignmentCell
        {...defaultProps}
        operators={['John Smith', 'Bob Johnson']}
      />
    )

    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  test('should display current user with teal color when in the operators list', () => {
    render(
      <ReassignmentCell
        {...defaultProps}
        operators={['John Smith', 'Jane Doe']}
      />
    )

    const currentUserElement = screen.getByText('Jane Doe')
    expect(currentUserElement).toHaveClass('text-teal-500')
  })
})
