import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'
import VehicleList, { deriveStatusLabel } from './VehicleList'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from './testHelpers'

const mockResponse = {
  result: [
    { vehicleName: 'ahi', color: '#FF9900' },
    { vehicleName: 'aku', color: '#CC33FF' },
    { vehicleName: 'brizo', color: '#f4ba0c' },
    { vehicleName: 'daphne', color: '#FF9900' },
    { vehicleName: 'galene', color: '#CC33FF' },
    { vehicleName: 'makai', color: '#FF0000' },
    { vehicleName: 'melia', color: '#FF0000' },
    { vehicleName: 'mesobot', color: '#FF0000' },
    { vehicleName: 'opah', color: '#CC33FF' },
    { vehicleName: 'polaris', color: '#FF0000' },
    { vehicleName: 'pontus', color: '#BD9782' },
    { vehicleName: 'sim', color: '#FF0000' },
    { vehicleName: 'stella', color: '#FF0000' },
    { vehicleName: 'tethys', color: '#CC33FF' },
    { vehicleName: 'triton', color: '#f4ba0c' },
  ],
}

const server = setupServer(
  rest.get('/info/vehicles', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('VehicleList', () => {
  test('should render the component', async () => {
    expect(() =>
      render(
        <MockProviders queryClient={new QueryClient()}>
          <VehicleList />
        </MockProviders>
      )
    ).not.toThrow()
  })
})

describe('deriveStatusLabel', () => {
  test('returns "Recovered" when recoverEvent is present', () => {
    expect(
      deriveStatusLabel({ recoverEvent: { eventId: 123 }, missionText: '' })
    ).toBe('Recovered')
  })

  test('returns "Recovered" when text_mission contains RECOVERED', () => {
    expect(
      deriveStatusLabel({ recoverEvent: null, missionText: 'RECOVERED' })
    ).toBe('Recovered')
  })

  test('returns "Plugged in" when text_mission contains PLUGGED', () => {
    expect(
      deriveStatusLabel({ recoverEvent: null, missionText: 'PLUGGED IN' })
    ).toBe('Plugged in')
  })

  test('returns running mission label for an active mission', () => {
    expect(
      deriveStatusLabel({
        recoverEvent: null,
        missionText: 'some active mission',
        mission: 'sci2.xml',
      })
    ).toBe('Running sci2.xml')
  })

  test('falls back to "Running mission" when mission name is absent', () => {
    expect(
      deriveStatusLabel({ recoverEvent: null, missionText: '', mission: null })
    ).toBe('Running mission')
  })
})
