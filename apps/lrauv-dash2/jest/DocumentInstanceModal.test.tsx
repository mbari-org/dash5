import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import toast from 'react-hot-toast'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-hot-toast', () => {
  const t = {
    success: jest.fn(),
    error: jest.fn(),
  }
  return { __esModule: true, default: t }
})

jest.mock('../lib/useGlobalModalId', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@mbari/api-client', () => ({
  useDocumentInstance: jest.fn(),
  useDocuments: jest.fn(),
  useCreateDocument: jest.fn(),
  useCreateDocumentInstance: jest.fn(),
  useDeleteDocumentInstance: jest.fn(),
}))

// Avoid TipTap/ProseMirror in jsdom by stubbing DocEditor and DocViewer
jest.mock('../components/docs/DocEditor', () => ({
  __esModule: true,
  default: ({
    html,
    onChange,
  }: {
    html: string
    onChange?: (v: string) => void
  }) => (
    <div
      data-testid="doc-editor"
      onClick={() => onChange?.('<p>edited content</p>')}
    >
      {html}
    </div>
  ),
}))

jest.mock('../components/docs/DocViewer', () => ({
  __esModule: true,
  default: ({ html }: { html: string }) => (
    <div data-testid="doc-viewer">{html}</div>
  ),
}))

// Stub wait() so tests don't pause for 2 s
jest.mock('@mbari/utils', () => ({
  ...jest.requireActual('@mbari/utils'),
  wait: jest.fn(() => Promise.resolve()),
}))

// Provide a stub QueryClient so useQueryClient() doesn't throw
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}))

// ── Imports after mocks ───────────────────────────────────────────────────────

import useGlobalModalId from '../lib/useGlobalModalId'
import {
  useDocumentInstance,
  useDocuments,
  useCreateDocument,
  useCreateDocumentInstance,
  useDeleteDocumentInstance,
} from '@mbari/api-client'

import DocumentInstanceModal from '../components/DocumentInstanceModal'

// ── Shared fixture ────────────────────────────────────────────────────────────

const INSTANCE_ID = 3004095
const DOC_ID = 3000788
const UNIX_TIME = 1656376737014 // 2022-06-27 ...
const USER = 'Brett Hobson'

const mockInstanceData = {
  docInstanceId: INSTANCE_ID,
  docId: DOC_ID,
  docName: 'Daphne Deployment Plan',
  user: USER,
  email: 'hobson@mbari.org',
  unixTime: UNIX_TIME,
  text: '<p>Hello world</p>',
  docInstanceBriefs: [
    { docInstanceId: INSTANCE_ID, unixTime: UNIX_TIME, user: USER },
  ],
}

const mockDocsList = [
  {
    docId: DOC_ID,
    docType: 'NORMAL',
    latestRevision: { docInstanceId: INSTANCE_ID },
    docInstanceBriefs: [{ docInstanceId: INSTANCE_ID }],
  },
]

function setupMocks({
  createRevision = jest.fn().mockResolvedValue({
    docInstanceId: INSTANCE_ID + 1,
    docName: 'Daphne Deployment Plan',
    text: '<p>Hello world</p>',
  }),
} = {}) {
  ;(useGlobalModalId as jest.Mock).mockReturnValue({
    globalModalId: { id: 'editDocument', meta: { docInstanceId: INSTANCE_ID } },
    setGlobalModalId: jest.fn(),
  })
  ;(useDocumentInstance as jest.Mock).mockReturnValue({
    data: mockInstanceData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    refetch: jest.fn().mockResolvedValue({}),
  })
  ;(useDocuments as jest.Mock).mockReturnValue({
    data: mockDocsList,
    isLoading: false,
  })
  ;(useCreateDocument as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  })
  ;(useCreateDocumentInstance as jest.Mock).mockReturnValue({
    mutateAsync: createRevision,
    isLoading: false,
  })
  ;(useDeleteDocumentInstance as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DocumentInstanceModal — last-editor attribution (fix #619 item 4)', () => {
  it('shows the last-saved user and timestamp when the API returns user info', async () => {
    setupMocks()
    render(<DocumentInstanceModal />)

    await waitFor(() => {
      expect(screen.getByText(/Last saved/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Brett Hobson/i)).toBeInTheDocument()
  })

  it('does not show last-saved line when user info is absent', async () => {
    setupMocks()
    ;(useDocumentInstance as jest.Mock).mockReturnValue({
      data: { ...mockInstanceData, user: '' },
      isLoading: false,
      isError: false,
      isSuccess: true,
      refetch: jest.fn(),
    })

    render(<DocumentInstanceModal />)

    await waitFor(() => {
      // The viewer should render (proving the component loaded)
      expect(screen.getByTestId('doc-viewer')).toBeInTheDocument()
    })
    expect(screen.queryByText(/Last saved/i)).not.toBeInTheDocument()
  })
})

describe('DocumentInstanceModal — duplicate document flow (fix #728)', () => {
  function setupDuplicateMocks() {
    ;(useGlobalModalId as jest.Mock).mockReturnValue({
      globalModalId: {
        id: 'editDocument',
        meta: { docInstanceId: INSTANCE_ID, duplicate: true },
      },
      setGlobalModalId: jest.fn(),
    })
    ;(useDocumentInstance as jest.Mock).mockReturnValue({
      data: mockInstanceData,
      isLoading: false,
      isError: false,
      isSuccess: true,
      refetch: jest.fn().mockResolvedValue({}),
    })
    ;(useDocuments as jest.Mock).mockReturnValue({
      data: mockDocsList,
      isLoading: false,
    })
    ;(useCreateDocument as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
    })
    ;(useCreateDocumentInstance as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({
        docInstanceId: INSTANCE_ID + 1,
        docName: 'Daphne Deployment Plan (duplicate)',
        text: '<p>Hello world</p>',
      }),
      isLoading: false,
    })
    ;(useDeleteDocumentInstance as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
    })
  }

  it('loads source content when duplicate=true (query is not blocked)', async () => {
    setupDuplicateMocks()
    render(<DocumentInstanceModal />)

    // If the query were still blocked by a !duplicate guard, existingData would be
    // undefined and the name field would be empty. Presence of the "(duplicate)"
    // suffix proves the query ran and returned the source document's docName.
    await waitFor(() => {
      expect(
        screen.getByDisplayValue(/Daphne Deployment Plan \(duplicate\)/i)
      ).toBeInTheDocument()
    })
  })

  it('pre-fills the document name with "(duplicate)" suffix', async () => {
    setupDuplicateMocks()
    render(<DocumentInstanceModal />)

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue(
        /Daphne Deployment Plan \(duplicate\)/i
      )
      expect(nameInput).toBeInTheDocument()
    })
  })

  it('opens in edit mode so the user can immediately edit the copy', async () => {
    setupDuplicateMocks()
    render(<DocumentInstanceModal />)

    // Edit mode renders the doc-editor, not the read-only doc-viewer
    await waitFor(() => {
      expect(screen.getByTestId('doc-editor')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('doc-viewer')).not.toBeInTheDocument()
  })

  it('does NOT overwrite content when the query returns undefined data', async () => {
    setupDuplicateMocks()
    // Simulate an error state: isSuccess=false, data=undefined
    ;(useDocumentInstance as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isSuccess: false,
      refetch: jest.fn(),
    })
    render(<DocumentInstanceModal />)

    // The editor/viewer should not show stale or blank content from a failed query
    await waitFor(() => {
      // Component renders without crashing
      expect(screen.queryByTestId('doc-editor')).not.toBeInTheDocument()
    })
  })
})

describe('DocumentInstanceModal — save error handling (fix #619 item 1)', () => {
  it('shows an error toast when createRevision throws instead of silently failing', async () => {
    const failingCreate = jest
      .fn()
      .mockRejectedValue(new Error('Network error'))
    setupMocks({ createRevision: failingCreate })

    render(<DocumentInstanceModal />)

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText(/Edit/i)).toBeInTheDocument()
    })

    // Enter edit mode
    fireEvent.click(screen.getByText(/Edit/i))

    // The Save / confirm button should now be enabled
    const saveButton = screen.getByRole('button', { name: /Save/i })
    expect(saveButton).not.toBeDisabled()

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringMatching(/Failed to save/i)
      )
    })
  })

  it('does NOT show a success toast when the save fails', async () => {
    const failingCreate = jest
      .fn()
      .mockRejectedValue(new Error('Network error'))
    setupMocks({ createRevision: failingCreate })

    render(<DocumentInstanceModal />)

    await waitFor(() => screen.getByText(/Edit/i))
    fireEvent.click(screen.getByText(/Edit/i))
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    expect(toast.success).not.toHaveBeenCalled()
  })
})
