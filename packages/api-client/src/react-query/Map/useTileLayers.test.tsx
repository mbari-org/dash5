import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useTileLayers } from './useTileLayers'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockTileLayers = [
  {
    name: 'SST 1 Day Composite',
    urlTemplate: 'https://example.com/wms',
    wms: true,
    options: {
      layers: 'sst_1day',
      format: 'image/png',
      transparent: 'true',
      opacity: 0.8,
    },
  },
  {
    name: 'Cell phone coverage map',
    urlTemplate: 'https://tiles.example.com/{z}/{x}/{y}.png',
    wms: false,
    options: { attribution: 'Coverage &copy; Example', maxZoom: 18 },
  },
]

const server = setupServer(
  rest.get('/info/map/tileLayers', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: mockTileLayers }))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockTileLayers: React.FC = () => {
  const query = useTileLayers()
  return query.isLoading ? null : (
    <div>
      <span data-testid="name">{query.data?.[0].name ?? 'Loading'}</span>
    </div>
  )
}

describe('useTileLayers', () => {
  it('should display the first tile layer name after unwrapping { result }', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockTileLayers />
      </MockProviders>
    )
    await waitFor(() => screen.getByText(mockTileLayers[0].name))
    expect(screen.getByTestId('name')).toHaveTextContent(mockTileLayers[0].name)
  })
})
