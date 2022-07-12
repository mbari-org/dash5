import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { mockResponse } from '../../axios/Event/createNote.test'
import { useCreateNote } from './useCreateNote'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.post('/events/note', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockNoteAction: React.FC = () => {
  const { mutate, isLoading, data } = useCreateNote()
  const handleClick = () => {
    mutate({
      vehicle: 'sim',
      note: 'This is a test.',
    })
  }
  return isLoading ? null : (
    <div>
      <button onClick={handleClick}>Send Note</button>
      {data && <span data-testid="result">{data.vehicle}</span>}
    </div>
  )
}

describe('useCreateNote', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockNoteAction />
      </MockProviders>
    )
    fireEvent.click(screen.getByText('Send Note'))
    await waitFor(() => {
      return screen.getByText(mockResponse.result.vehicle)
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse.result.vehicle
    )
  })
})
