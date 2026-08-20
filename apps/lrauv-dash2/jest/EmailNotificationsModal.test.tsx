import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('../components/ConfirmContext', () => ({
  useConfirm: () => jest.fn(),
}))

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn(),
  })),
}))

const mockAddExtraEmail = jest.fn()
const mockUpdateEmailAddress = jest.fn()

jest.mock('@mbari/api-client', () => ({
  useTethysApiContext: jest.fn(),
  useEmailAddresses: jest.fn(),
  useEmailSettings: jest.fn(),
  useSiteConfig: jest.fn(),
  useUpdateEmailSettings: jest.fn(),
  useSendTestEmail: jest.fn(),
  useAddExtraEmail: jest.fn(),
  useUpdateEmailAddress: jest.fn(),
  useDeleteEmailAddress: jest.fn(),
}))

jest.mock('../components/AddEmailDialog', () => ({
  __esModule: true,
  default: ({
    onAdd,
  }: {
    onAdd: (email: string, code: string, makeDefault?: boolean) => void
  }) => (
    <button type="button" onClick={() => onAdd('extra@example.com', '482913')}>
      Simulate add
    </button>
  ),
}))

jest.mock('../components/EditEmailDialog', () => ({
  __esModule: true,
  default: () => null,
}))

import {
  useTethysApiContext,
  useEmailAddresses,
  useEmailSettings,
  useSiteConfig,
  useUpdateEmailSettings,
  useSendTestEmail,
  useAddExtraEmail,
  useUpdateEmailAddress,
  useDeleteEmailAddress,
} from '@mbari/api-client'
import EmailNotificationsModal from '../components/EmailNotificationsModal'

const ACCOUNT_EMAIL = 'primary@example.com'

function setupMocks() {
  ;(useTethysApiContext as jest.Mock).mockReturnValue({
    profile: { email: ACCOUNT_EMAIL },
    axiosInstance: {},
    token: 'token',
  })
  ;(useEmailAddresses as jest.Mock).mockReturnValue({
    data: {
      result: {
        [ACCOUNT_EMAIL]: { ownerEmail: null, ownerName: 'Primary' },
      },
    },
    isLoading: false,
  })
  ;(useEmailSettings as jest.Mock).mockReturnValue({
    data: { plainText: 'n', details: {} },
    isLoading: false,
  })
  ;(useSiteConfig as jest.Mock).mockReturnValue({
    data: { vehicleNames: ['sim'], eventKinds: [] },
    isLoading: false,
  })
  ;(useUpdateEmailSettings as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
  })
  ;(useSendTestEmail as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
  })
  ;(useAddExtraEmail as jest.Mock).mockReturnValue({
    mutate: mockAddExtraEmail,
    isLoading: false,
  })
  ;(useUpdateEmailAddress as jest.Mock).mockReturnValue({
    mutate: mockUpdateEmailAddress,
    isLoading: false,
  })
  ;(useDeleteEmailAddress as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  setupMocks()
})

describe('EmailNotificationsModal extra-email API', () => {
  it('sends addExtraEmail (singular) and code when adding a destination', async () => {
    const user = userEvent.setup()
    render(<EmailNotificationsModal />)

    await user.click(screen.getByRole('button', { name: 'Add destination' }))
    await user.click(screen.getByRole('button', { name: 'Simulate add' }))

    expect(mockAddExtraEmail).toHaveBeenCalledTimes(1)
    expect(mockAddExtraEmail).toHaveBeenCalledWith(
      {
        email: ACCOUNT_EMAIL,
        addExtraEmail: 'extra@example.com',
        code: '482913',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    )
    const payload = mockAddExtraEmail.mock.calls[0][0]
    expect(payload).not.toHaveProperty('addExtraEmails')
    expect(payload).not.toHaveProperty('extraEmails')
  })
})
