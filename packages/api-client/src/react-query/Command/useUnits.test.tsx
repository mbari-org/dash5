import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useUnits } from './useUnits'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Command/getUnits.test'

const server = setupServer(
  rest.get('/commands/units', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockUnit: React.FC = () => {
  const query = useUnits()

  return query.isLoading ? null : (
    <div>
      <span data-testid="unit">{query.data?.[0].name ?? 'Loading'}</span>
    </div>
  )
}

describe('useUnits', () => {
  it('should display the unit name', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockUnit />
      </MockProviders>
    )
    const unit = mockResponse.result[0].name
    await waitFor(() => {
      return screen.getByText(unit)
    })

    expect(screen.getByTestId('unit')).toHaveTextContent(unit)
  })
})
