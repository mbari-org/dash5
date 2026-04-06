import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { usePolygons } from './usePolygons'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = [
  {
    name: 'US Shipping Lanes',
    geojson: {
      type: 'FeatureCollection',
      name: 'US Shipping Lanes',
      properties: { color: '#3388ff' },
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-120, 35],
                [-118, 35],
                [-118, 37],
                [-120, 37],
                [-120, 35],
              ],
            ],
          },
        },
      ],
    },
  },
]

const server = setupServer(
  rest.get('/map/layers/polygons', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockPolygons: React.FC = () => {
  const query = usePolygons()
  return query.isLoading ? null : (
    <div>
      <span data-testid="name">{query.data?.[0].name ?? 'Loading'}</span>
    </div>
  )
}

describe('usePolygons', () => {
  it('should display the first polygon name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockPolygons />
      </MockProviders>
    )
    await waitFor(() => screen.getByText(mockResponse[0].name))
    expect(screen.getByTestId('name')).toHaveTextContent(mockResponse[0].name)
  })
})
