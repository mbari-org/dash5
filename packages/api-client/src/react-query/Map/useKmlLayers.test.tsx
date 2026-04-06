import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useKmlLayers } from './useKmlLayers'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockKmlLayers = [
  { name: 'Untitled_Polygon.kml', path: '/kml/Untitled_Polygon.kml' },
  {
    name: 'Lake Erie survey',
    path: '/kml/t1.21217.1616.LakeErie.143.250m.kml',
  },
  { name: 'Archive overlay', path: '/kml/archive.kmz' },
]

const server = setupServer(
  rest.get('/info/map/kmlLayers', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ result: mockKmlLayers }))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockKmlLayers: React.FC = () => {
  const query = useKmlLayers()
  return query.isLoading ? null : (
    <div>
      <span data-testid="name">{query.data?.[0].name ?? 'Loading'}</span>
    </div>
  )
}

describe('useKmlLayers', () => {
  it('should display the first KML layer name after unwrapping { result }', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockKmlLayers />
      </MockProviders>
    )
    await waitFor(() => screen.getByText(mockKmlLayers[0].name))
    expect(screen.getByTestId('name')).toHaveTextContent(mockKmlLayers[0].name)
  })
})
