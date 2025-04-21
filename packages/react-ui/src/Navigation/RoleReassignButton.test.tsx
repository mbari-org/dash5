import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RoleReassignButton } from './RoleReassignButton'

describe('RoleReassignButton', () => {
  test('should render the component with default props', () => {
    expect(() => render(<RoleReassignButton />)).not.toThrow()
  })

  test('should display "No PIC" when pics array is empty', () => {
    render(<RoleReassignButton />)
    expect(screen.getByText('No PIC')).toBeInTheDocument()
  })

  test('should display "No On Call" when onCalls array is empty', () => {
    render(<RoleReassignButton />)
    expect(screen.getByText('No On Call')).toBeInTheDocument()
  })

  test('should display shortenedsingle PIC name when provided', () => {
    render(<RoleReassignButton pics={['John Doe']} />)
    expect(screen.getByText('John D.')).toBeInTheDocument()
  })

  test('should display the count when multiple PICs are provided', () => {
    render(
      <RoleReassignButton pics={['John Doe', 'Jane Smith', 'Bob Johnson']} />
    )
    expect(screen.getByText('3 PIC')).toBeInTheDocument()
  })

  test('should display "You" when current user is the only PIC', () => {
    render(
      <RoleReassignButton
        pics={['Alice Cooper']}
        currentUserName="Alice Cooper"
      />
    )
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  test('should display "You and X others" when current user is one of multiple PICs', () => {
    render(
      <RoleReassignButton
        pics={['Alice Cooper', 'Bob Dylan', 'Charlie Parker']}
        currentUserName="Alice Cooper"
      />
    )
    expect(screen.getByText('You and 2 others')).toBeInTheDocument()
  })

  test('should display "You and 1 other" when current user is one of two PICs', () => {
    render(
      <RoleReassignButton
        pics={['Alice Cooper', 'Bob Dylan']}
        currentUserName="Alice Cooper"
      />
    )
    expect(screen.getByText('You and 1 other')).toBeInTheDocument()
  })

  test('should apply active style to PIC label when current user is PIC', () => {
    render(
      <RoleReassignButton
        pics={['Alice Cooper']}
        currentUserName="Alice Cooper"
      />
    )

    const element = screen.getByText('You')
    expect(element).toHaveClass('text-teal-500')
  })

  test('should apply active style to onCall label when current user is on call', () => {
    render(
      <RoleReassignButton
        onCalls={['Alice Cooper']}
        currentUserName="Alice Cooper"
      />
    )

    const element = screen.getByText('You')
    expect(element).toHaveClass('text-teal-500')
  })

  test('should display shortened name for a single onCall user', () => {
    render(<RoleReassignButton onCalls={['John Smith']} />)
    expect(screen.getByText('John S.')).toBeInTheDocument()
  })

  test('should display the count when multiple onCalls are provided', () => {
    render(
      <RoleReassignButton onCalls={['John Doe', 'Jane Smith', 'Bob Johnson']} />
    )
    expect(screen.getByText('3 On Call')).toBeInTheDocument()
  })
})
