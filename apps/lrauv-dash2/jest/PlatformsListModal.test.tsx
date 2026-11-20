import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'

const mockSetFlyToRequest = jest.fn()
const mockGetPlatformPositions = jest.fn()
const mockUsePlatforms = jest.fn()
const mockUseTethysApiContext = jest.fn()

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}))

jest.mock('@mbari/utils', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}))

jest.mock('@mbari/react-ui', () => ({
  Modal: ({
    children,
    title,
  }: {
    children: React.ReactNode
    title: React.ReactNode
  }) => (
    <div>
      {title}
      {children}
    </div>
  ),
}))

jest.mock('@mbari/api-client', () => ({
  usePlatforms: (...args: unknown[]) => mockUsePlatforms(...args),
  getPlatformPositions: (...args: unknown[]) =>
    mockGetPlatformPositions(...args),
  useTethysApiContext: (...args: unknown[]) => mockUseTethysApiContext(...args),
}))

const mockTogglePlatformSelection = jest.fn()
const mockUsePlatformSelectionWorkflow = jest.fn()

jest.mock('../lib/usePlatformSelectionWorkflow', () => ({
  usePlatformSelectionWorkflow: (...args: unknown[]) =>
    mockUsePlatformSelectionWorkflow(...args),
}))

jest.mock('../components/MapCameraContext', () => ({
  useMapCamera: () => ({
    setFlyToRequest: mockSetFlyToRequest,
  }),
}))

import { PlatformsListModal } from '../components/PlatformsListModal'

const paragon = {
  _id: 'plat-paragon',
  name: 'R/V Paragon',
  abbreviation: 'PRG',
  typeName: 'Ship',
  color: '#00ffff',
  iconUrl: null,
}

const axiosInstance = { get: jest.fn() }
const odss2dashApi = 'https://okeanids.mbari.org/odss2dash/api'

const createClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const renderModal = (client = createClient()) => {
  render(
    <QueryClientProvider client={client}>
      <PlatformsListModal onClose={jest.fn()} />
    </QueryClientProvider>
  )
  return client
}

describe('PlatformsListModal fly-to', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePlatforms.mockReturnValue({
      data: [paragon],
      isLoading: false,
      refetch: jest.fn(),
    })
    mockUseTethysApiContext.mockReturnValue({
      axiosInstance,
      siteConfig: { appConfig: { odss2dashApi } },
    })
    mockUsePlatformSelectionWorkflow.mockReturnValue({
      workingSelection: ['plat-paragon'],
      togglePlatformSelection: mockTogglePlatformSelection,
      unselectAll: jest.fn(),
      reset: jest.fn(),
      apply: jest.fn(),
      hasChanges: false,
      isApplying: false,
    })
  })

  it('flies immediately from a cached track position without querying TrackDB', async () => {
    const client = createClient()
    client.setQueryData(
      ['trackdb', 'platforms', 'plat-paragon', 'positions', 20],
      {
        positions: [
          { timeMs: 2000, lat: 36.9, lon: -122.1 },
          { timeMs: 1000, lat: 36.8, lon: -122.0 },
        ],
      }
    )

    renderModal(client)

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(mockGetPlatformPositions).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).toHaveBeenCalledWith({
      lat: 36.9,
      lon: -122.1,
    })
  })

  it('flies to the newest cached fix when track and last-1 caches disagree', async () => {
    const client = createClient()
    client.setQueryData(
      ['trackdb', 'platforms', 'plat-paragon', 'positions', 20],
      {
        positions: [{ timeMs: 1000, lat: 36.0, lon: -122.0 }],
      }
    )
    client.setQueryData(
      ['trackdb', 'platforms', 'plat-paragon', 'positions', 1],
      {
        positions: [{ timeMs: 9000, lat: 37.5, lon: -122.5 }],
      }
    )

    renderModal(client)

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(mockGetPlatformPositions).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).toHaveBeenCalledWith({
      lat: 37.5,
      lon: -122.5,
    })
  })

  it('fetches only the latest fix with no date window', async () => {
    mockGetPlatformPositions.mockResolvedValue({
      positions: [{ timeMs: 1, lat: 36.8, lon: -122.0 }],
    })

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(mockSetFlyToRequest).toHaveBeenCalledWith({
        lat: 36.8,
        lon: -122.0,
      })
    })

    const [params, config] = mockGetPlatformPositions.mock.calls[0]
    expect(params).toEqual({
      platformId: 'plat-paragon',
      lastNumberOfFixes: 1,
    })
    expect(params.startDate).toBeUndefined()
    expect(params.endDate).toBeUndefined()
    expect(config).toEqual(
      expect.objectContaining({
        instance: axiosInstance,
        baseURL: odss2dashApi,
      })
    )
  })

  it('fetches position when platform is toggled on', async () => {
    mockGetPlatformPositions.mockResolvedValue({
      positions: [{ timeMs: 1, lat: 36.8, lon: -122.0 }],
    })
    // Render with platform not yet selected so the toggle fires the fetch.
    // beforeEach will restore the default on the next test.
    mockUsePlatformSelectionWorkflow.mockReturnValue({
      workingSelection: [],
      togglePlatformSelection: mockTogglePlatformSelection,
      unselectAll: jest.fn(),
      reset: jest.fn(),
      apply: jest.fn(),
      hasChanges: false,
      isApplying: false,
    })

    renderModal()

    await userEvent.click(screen.getByRole('checkbox', { name: /paragon/i }))

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-paragon',
          lastNumberOfFixes: 1,
        }),
        expect.anything()
      )
    })
  })

  it('does not query TrackDB when odss2dashApi is missing', async () => {
    mockUseTethysApiContext.mockReturnValue({
      axiosInstance,
      siteConfig: { appConfig: {} },
    })

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(mockGetPlatformPositions).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
  })

  it('does not fly and disables the button when the platform has no positions', async () => {
    mockGetPlatformPositions.mockResolvedValue({ positions: [] })

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalled()
    })
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'No position available' })
      ).toHaveAttribute('aria-disabled', 'true')
    })
  })

  it('does not fly and disables the button when lat or lon is non-finite', async () => {
    mockGetPlatformPositions.mockResolvedValue({
      positions: [{ timeMs: 1, lat: Infinity, lon: -122.0 }],
    })

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalled()
    })
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'No position available' })
      ).toHaveAttribute('aria-disabled', 'true')
    })
  })

  it('does not fly when the position fetch fails', async () => {
    mockGetPlatformPositions.mockRejectedValue(new Error('network down'))

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalled()
    })
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
  })

  it('flies from the last-1 cache entry without refetching', async () => {
    const client = createClient()
    client.setQueryData(
      ['trackdb', 'platforms', 'plat-paragon', 'positions', 1],
      { positions: [{ timeMs: 5000, lat: 37.1, lon: -122.3 }] }
    )

    renderModal(client)

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(mockGetPlatformPositions).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).toHaveBeenCalledWith({ lat: 37.1, lon: -122.3 })
  })

  it('disables the button without refetching when last-1 cache has no finite position', async () => {
    // Seed the cache with a known-empty last-1 entry.
    const client = createClient()
    client.setQueryData(
      ['trackdb', 'platforms', 'plat-paragon', 'positions', 1],
      { positions: [] }
    )

    renderModal(client)

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(mockGetPlatformPositions).not.toHaveBeenCalled()
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'No position available' })
      ).toHaveAttribute('aria-disabled', 'true')
    })
  })

  it('re-fetches on click when no cache entry exists', async () => {
    // Verifies the cache-miss path that Refresh produces: empty cache +
    // cleared noPositionIds means the next click fetches rather than bailing.
    mockGetPlatformPositions.mockResolvedValue({
      positions: [{ timeMs: 1, lat: 36.8, lon: -122.0 }],
    })

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-paragon',
          lastNumberOfFixes: 1,
        }),
        expect.anything()
      )
    })
    expect(mockSetFlyToRequest).toHaveBeenCalledWith({ lat: 36.8, lon: -122.0 })
  })

  it('does not disable the button when the toggle-on position fetch fails', async () => {
    // A network/config error is not "no position" — the button should stay
    // enabled so the user can retry.
    mockGetPlatformPositions.mockRejectedValue(new Error('network down'))
    mockUsePlatformSelectionWorkflow.mockReturnValue({
      workingSelection: [],
      togglePlatformSelection: mockTogglePlatformSelection,
      unselectAll: jest.fn(),
      reset: jest.fn(),
      apply: jest.fn(),
      hasChanges: false,
      isApplying: false,
    })

    const client = createClient()
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <PlatformsListModal onClose={jest.fn()} />
      </QueryClientProvider>
    )

    await userEvent.click(screen.getByRole('checkbox', { name: /paragon/i }))

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalled()
    })

    // Platform now selected — button visible.
    mockUsePlatformSelectionWorkflow.mockReturnValue({
      workingSelection: ['plat-paragon'],
      togglePlatformSelection: mockTogglePlatformSelection,
      unselectAll: jest.fn(),
      reset: jest.fn(),
      apply: jest.fn(),
      hasChanges: false,
      isApplying: false,
    })
    rerender(
      <QueryClientProvider client={client}>
        <PlatformsListModal onClose={jest.fn()} />
      </QueryClientProvider>
    )

    // Button should be enabled — network error, not an empty position result.
    expect(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('re-enables the button when platform is toggled off and back on with a valid position', async () => {
    // First toggle-on returns no position — button disabled.
    mockGetPlatformPositions.mockResolvedValue({ positions: [] })

    const client = createClient()
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <PlatformsListModal onClose={jest.fn()} />
      </QueryClientProvider>
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'No position available' })
      ).toHaveAttribute('aria-disabled', 'true')
    })

    // Toggle platform OFF — platform deselected, noPositionIds entry cleared.
    mockUsePlatformSelectionWorkflow.mockReturnValue({
      workingSelection: [],
      togglePlatformSelection: mockTogglePlatformSelection,
      unselectAll: jest.fn(),
      reset: jest.fn(),
      apply: jest.fn(),
      hasChanges: false,
      isApplying: false,
    })
    rerender(
      <QueryClientProvider client={client}>
        <PlatformsListModal onClose={jest.fn()} />
      </QueryClientProvider>
    )

    // Toggle back ON — this time fetch returns a valid position.
    mockGetPlatformPositions.mockResolvedValue({
      positions: [{ timeMs: 1, lat: 36.8, lon: -122.0 }],
    })
    await userEvent.click(screen.getByRole('checkbox', { name: /paragon/i }))

    mockUsePlatformSelectionWorkflow.mockReturnValue({
      workingSelection: ['plat-paragon'],
      togglePlatformSelection: mockTogglePlatformSelection,
      unselectAll: jest.fn(),
      reset: jest.fn(),
      apply: jest.fn(),
      hasChanges: false,
      isApplying: false,
    })
    rerender(
      <QueryClientProvider client={client}>
        <PlatformsListModal onClose={jest.fn()} />
      </QueryClientProvider>
    )

    // Button should be enabled — toggle-on success cleared the stale no-position flag.
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Center map on R/V Paragon' })
      ).not.toHaveAttribute('aria-disabled', 'true')
    })
  })
})
