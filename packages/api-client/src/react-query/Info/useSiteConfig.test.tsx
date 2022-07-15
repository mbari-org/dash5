import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useSiteConfig } from './useSiteConfig'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Info/getInfo.test'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockSiteConfig: React.FC = () => {
  const query = useSiteConfig({})
  return query.isLoading ? null : (
    <div data-testid="result">
      {query.data?.appConfig.recaptcha.siteKey ?? 'Not logged in'}
    </div>
  )
}

describe('useSiteConfig', () => {
  it('should render the recaptcha site key if successful', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockSiteConfig />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.result.appConfig.recaptcha.siteKey)
    })
    expect(
      screen.queryByText(mockResponse.result.appConfig.recaptcha.siteKey)
    ).toHaveTextContent(mockResponse.result.appConfig.recaptcha.siteKey)
  })
})
