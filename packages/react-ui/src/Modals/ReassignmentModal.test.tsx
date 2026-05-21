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
            picOperators: [{ user: 'Pic 1', unixTime: Date.now() }],
            onCallOperators: [{ user: 'On-Call 1', unixTime: Date.now() }],
          },
          {
            name: 'Vehicle 2',
            picOperators: [{ user: 'Pic 2', unixTime: Date.now() }],
            onCallOperators: [{ user: 'On-Call 2', unixTime: Date.now() }],
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
