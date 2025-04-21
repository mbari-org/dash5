import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReassignmentTable } from './ReassignmentTable'

describe('ReassignmentTable', () => {
  const mockOnRoleChange = jest.fn()
  const defaultProps = {
    vehicles: [
      {
        name: 'Vehicle 1',
        picOperators: ['John Smith'],
        onCallOperators: ['Jane Doe', 'Ralph Person'],
      },
      {
        name: 'Vehicle 2',
        picOperators: [],
        onCallOperators: ['Bob Johnson'],
      },
    ],
    currentUserName: 'Test User',
    onRoleChange: mockOnRoleChange,
  }

  test('should render without errors', () => {
    expect(() => render(<ReassignmentTable {...defaultProps} />)).not.toThrow()
  })

  test('should render table headers correctly', () => {
    render(<ReassignmentTable {...defaultProps} />)
    expect(screen.getByText('PIC')).toBeInTheDocument()
    expect(screen.getByText('On-call')).toBeInTheDocument()
  })

  test('should render vehicle names', () => {
    render(<ReassignmentTable {...defaultProps} />)
    expect(screen.getByText('Vehicle 1')).toBeInTheDocument()
    expect(screen.getByText('Vehicle 2')).toBeInTheDocument()
  })

  test('should display PIC operator names', () => {
    render(<ReassignmentTable {...defaultProps} />)
    expect(screen.getByText('John Smith')).toBeInTheDocument()
  })

  test('should display on-call operator names', () => {
    render(<ReassignmentTable {...defaultProps} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Ralph Person')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })
})
