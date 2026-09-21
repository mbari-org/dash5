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

jest.mock('../lib/usePlatformSelectionWorkflow', () => ({
  usePlatformSelectionWorkflow: () => ({
    workingSelection: [],
    togglePlatformSelection: jest.fn(),
    unselectAll: jest.fn(),
    reset: jest.fn(),
    apply: jest.fn(),
    hasChanges: false,
    isApplying: false,
  }),
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

  it('prefetches on hover so a later click can reuse one in-flight request', async () => {
    let resolveFetch: (value: unknown) => void = () => undefined
    mockGetPlatformPositions.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )

    renderModal()
    const button = screen.getByRole('button', {
      name: 'Center map on R/V Paragon',
    })

    await userEvent.hover(button)
    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalledTimes(1)
    })
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()

    await userEvent.click(button)
    expect(mockGetPlatformPositions).toHaveBeenCalledTimes(1)

    resolveFetch({
      positions: [{ timeMs: 1, lat: 36.8, lon: -122.0 }],
    })

    await waitFor(() => {
      expect(mockSetFlyToRequest).toHaveBeenCalledWith({
        lat: 36.8,
        lon: -122.0,
      })
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

  it('does not fly when the platform has no positions', async () => {
    mockGetPlatformPositions.mockResolvedValue({ positions: [] })

    renderModal()

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    await waitFor(() => {
      expect(mockGetPlatformPositions).toHaveBeenCalled()
    })
    expect(mockSetFlyToRequest).not.toHaveBeenCalled()
  })

  it('does not fly when lat or lon is non-finite', async () => {
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
})
