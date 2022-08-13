import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { useCreateCommand } from './useCreateCommand'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post('/commands', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

export const mockResponse = {
  result: {
    sentBy: 'jim@sumocreations.com',
    vehicle: 'sim',
    commandText:
      'configSet Express linearApproximation acoustic_receive_time ampere_hour persist',
    commandNote: 'Just a test for the SIM to preview the API response.',
    schedDate: 'asap',
    runCommand: false,
    schedId: 'ppaw',
  },
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockAlterAction: React.FC = () => {
  const { mutate, isLoading, data } = useCreateCommand()
  const handleClick = () => {
    mutate({
      commandText:
        'configSet Express linearApproximation acoustic_receive_time ampere_hour persist',
      vehicle: 'sim',
      commandNote: 'Just a test for the SIM to preview the API response.',
      schedDate: 'asap',
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Create Command</button>
      {data && <span data-testid="result">{data.schedId}</span>}
    </div>
  )
}

describe('useCreateCommand', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Create Command'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.schedId)
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.schedId
    )
  })
})
