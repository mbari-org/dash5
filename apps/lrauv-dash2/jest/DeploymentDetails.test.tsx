import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}))

// Mock hooks before importing the component under test
jest.mock('../lib/useCurrentDeployment', () => ({
  __esModule: true,
  default: () => ({
    deployment: {
      deploymentId: 999,
      name: 'Test Deployment',
    },
    vehicle: 'sim',
  }),
}))

jest.mock('@mbari/api-client', () => ({
  useTags: () => ({ data: undefined }),
  useUpdateDeployment: () => ({ mutate: jest.fn() }),
  useAlterDeployment: () => ({ mutate: mockAlterDeployment }),
  useCreateCommand: () => ({ mutate: mockCreateCommand }),
}))

// Simplified stand-in for DeploymentDetailsPopUp — renders just the controls
// needed to trigger the launch/recover dialog and call onSetDeploymentEventToCurrentTime.
jest.mock('@mbari/react-ui', () => ({
  DeploymentDetailsPopUp: ({
    onSetDeploymentEventToCurrentTime,
  }: {
    onSetDeploymentEventToCurrentTime: (event: string) => void
  }) => (
    <div>
      <button onClick={() => onSetDeploymentEventToCurrentTime('launch')}>
        Launch
      </button>
      <button onClick={() => onSetDeploymentEventToCurrentTime('recover')}>
        Recover
      </button>
    </div>
  ),
}))

const mockAlterDeployment = jest.fn()
const mockCreateCommand = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

import DeploymentDetails from '../components/DeploymentDetails'

test('opens LaunchCommandDialog when Launch is clicked', () => {
  render(<DeploymentDetails />)
  fireEvent.click(screen.getByText('Launch'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/Record Launch Event/i)).toBeInTheDocument()
})

test('opens LaunchCommandDialog for Recover event', () => {
  render(<DeploymentDetails />)
  fireEvent.click(screen.getByText('Recover'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByText(/Record Recover Event/i)).toBeInTheDocument()
})

test('no-command path: calls alterDeployment and closes dialog', async () => {
  mockAlterDeployment.mockImplementation(
    (_params: unknown, { onSuccess }: { onSuccess: () => void }) => {
      onSuccess()
    }
  )
  render(<DeploymentDetails />)
  fireEvent.click(screen.getByText('Launch'))
  fireEvent.click(screen.getByDisplayValue('none'))
  fireEvent.click(screen.getByText(/Record & Submit/i))

  await waitFor(() => {
    expect(mockAlterDeployment).toHaveBeenCalledTimes(1)
  })
  expect(mockAlterDeployment.mock.calls[0][0]).toMatchObject({
    deploymentId: 999,
    deploymentType: 'launch',
    note: 'Vehicle in water',
  })
  // Dialog should close after alter settles
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('command path: records event first then sends command on alter success', async () => {
  mockAlterDeployment.mockImplementation(
    (_params: unknown, { onSuccess }: { onSuccess: () => void }) => {
      onSuccess()
    }
  )
  mockCreateCommand.mockImplementation(
    (_params: unknown, { onSuccess }: { onSuccess: () => void }) => {
      onSuccess()
    }
  )
  render(<DeploymentDetails />)
  fireEvent.click(screen.getByText('Launch'))
  fireEvent.click(screen.getByText(/Record & Submit/i))

  await waitFor(() => {
    expect(mockAlterDeployment).toHaveBeenCalledTimes(1)
  })
  // alterDeployment (event) called before createCommand (Dash4 order)
  expect(mockAlterDeployment.mock.invocationCallOrder[0]).toBeLessThan(
    mockCreateCommand.mock.invocationCallOrder[0]
  )
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('command path: event failure closes dialog without sending command', async () => {
  mockAlterDeployment.mockImplementation(
    (_params: unknown, { onError }: { onError: () => void }) => {
      onError()
    }
  )
  render(<DeploymentDetails />)
  fireEvent.click(screen.getByText('Launch'))
  fireEvent.click(screen.getByText(/Record & Submit/i))

  await waitFor(() => {
    expect(mockAlterDeployment).toHaveBeenCalledTimes(1)
  })
  expect(mockCreateCommand).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('cancel closes dialog without calling alter or command', () => {
  render(<DeploymentDetails />)
  fireEvent.click(screen.getByText('Launch'))
  fireEvent.click(screen.getByText('Cancel'))
  expect(mockAlterDeployment).not.toHaveBeenCalled()
  expect(mockCreateCommand).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
