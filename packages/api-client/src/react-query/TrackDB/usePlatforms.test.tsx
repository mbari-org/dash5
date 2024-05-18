import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import { usePlatforms } from './usePlatforms'

const server = setupServer(
  rest.get('/info', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}))
  }),
  rest.get('/trackdb/platforms', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

const mockResponse = [
  {
    _id: '54065b5560d0e168c88d4012',
    name: 'm2',
    abbreviation: 'M2',
    typeName: 'mooring',
    color: '#00FF33',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d4013',
    name: 'tethys_cen',
    abbreviation: 'ThysCnt',
    typeName: 'auv',
    color: '#CC33FF',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d4014',
    name: 'stella202',
    abbreviation: 'St202',
    typeName: 'drifter',
    color: '#FFFF00',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d4015',
    name: 'TREX_pos',
    abbreviation: 'TRXPos',
    typeName: 'drifter',
    color: '#FFFF00',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d4016',
    name: 'Paragon',
    abbreviation: 'Prgn-SPOT',
    typeName: 'ship',
    color: '#FF0000',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d4017',
    name: 'seacon-5',
    abbreviation: 'Scn5',
    typeName: 'auv',
    color: '#CC33FF',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d4018',
    name: 'NPS_G29',
    abbreviation: 'NPS29',
    typeName: 'glider',
    color: '#FF9900',
    iconUrl: 'resources/images/platform-icons/spray-glider.png',
  },
  {
    _id: '54065b5560d0e168c88d4019',
    name: 'waveglider',
    abbreviation: 'wvgl',
    typeName: 'waveglider',
    color: '#CC66FF',
    iconUrl: null,
  },
  {
    _id: '54065b5560d0e168c88d401a',
    name: 'Martin',
    abbreviation: 'Mrtn',
    typeName: 'ship',
    color: '#FF0000',
    iconUrl: null,
  },
]

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockAlterAction: React.FC = () => {
  const { isLoading, data } = usePlatforms({ refresh: 'y' })

  return isLoading ? null : (
    <div>{data && <span data-testid="result">{data?.[0]._id}</span>}</div>
  )
}

describe('useAttachDocumentToDeployment', () => {
  it('should render the result upon submission', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockAlterAction />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse[0]._id.toString())
    })
    expect(screen.getByTestId('result')).toHaveTextContent(
      mockResponse[0]._id.toString()
    )
  })
})
