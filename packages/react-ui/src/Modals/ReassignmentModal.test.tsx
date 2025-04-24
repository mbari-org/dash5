import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReassignmentModal } from './ReassignmentModal'

describe('ReassignmentModal', () => {
  test('should render the vehicles', async () => {
    const onRoleChange = jest.fn()

    render(
      <ReassignmentModal
        open
        vehicles={[
          {
            name: 'Vehicle 1',
            picOperators: ['Pic 1'],
            onCallOperators: ['On-Call 1'],
          },
          {
            name: 'Vehicle 2',
            picOperators: ['Pic 2'],
            onCallOperators: ['On-Call 2'],
          },
        ]}
        currentUserName="Test User"
        onRoleChange={onRoleChange}
      />
    )

    expect(screen.getByText('Vehicle 1')).toBeInTheDocument()
    expect(screen.getByText('Vehicle 2')).toBeInTheDocument()
    expect(() => {
      screen.getByText('Vehicle 3')
    }).toThrow()
  })
})
