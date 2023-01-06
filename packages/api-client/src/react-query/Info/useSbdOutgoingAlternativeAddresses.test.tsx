import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useSbdOutgoingAlternativeAddresses } from './useSbdOutgoingAlternativeAddresses'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'

const mockResponse = {
  result: [
    'acomms-gwb@whoi.edu',
    'mbari.hotspot@gmail.com',
    'oreilly@mbari.org',
  ],
}

const mockAuthResponse = {
  result: {
    email: 'jim@sumocreations.com',
    firstName: 'Jim',
    lastName: 'Jeffers',
    roles: ['operator'],
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaXJzdE5hbWUiOiJKaW0iLCJsYXN0TmFtZSI6IkplZmZlcnMiLCJleHAiOjE2NTM3NzgzODYsImVtYWlsIjoiamltQHN1bW9jcmVhdGlvbnMuY29tIiwicm9sZXMiOlsib3BlcmF0b3IiXX0.iIE60rpDVtL56Kt9p_Zs4MFLaDj03ISiJ9TVjr44Q24',
  },
}

const server = setupServer(
  rest.get('/info/sbd/destAddresses', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  }),
  rest.get('/user/token', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockAuthResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockEmailList: React.FC = () => {
  const query = useSbdOutgoingAlternativeAddresses({})
  return (
    <>
      {query.isLoading
        ? null
        : query.data?.map((email, i) => (
            <div key={email} data-testid={`result${i}`}>
              {email}
            </div>
          ))}
    </>
  )
}

describe('useSbdOutgoingAlternativeAddresses', () => {
  it('should render the alternative addresses', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockEmailList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByTestId('result0')
    })

    expect(screen.getByTestId('result0')).toHaveTextContent(
      mockResponse.result[0]
    )
    expect(screen.getByTestId('result1')).toHaveTextContent(
      mockResponse.result[1]
    )
    expect(screen.getByTestId('result2')).toHaveTextContent(
      mockResponse.result[2]
    )
  })
})
