import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useVehicleInfo } from './useVehicleInfo'
import { QueryClient } from 'react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MockProviders } from '../queryTestHelpers'
import axios from 'axios'

const mockResponse = {
  text_ampago: '27m ago',
  text_vehicle: 'BRIZO',
  text_cell: '99:99',
  color_cell: 'st6',
  color_dirtbox: 'st18',
  text_leak: '',
  text_speed: '1.00m/s',
  text_dvlstatus: 'ON',
  text_stationdist: '12h 18m ago',
  color_commago: 'st4',
  text_commago: '27m ago',
  text_leakago: '',
  text_nextcomm: '19:03 - in 4h 32m',
  text_criticalerror: '',
  text_timeout: '19:57 - in 5h 27m',
  color_satcomm: 'st5',
  color_smallcable: 'st18',
  text_note: '',
  text_arrivestation: 'Arrived at WP',
  color_missionago: 'st4',
  text_gps: '13:57',
  color_gps: 'st4',
  color_sw: 'st3',
  text_flowago: '',
  text_currentdist: '',
  text_droptime: 'over 4 days ago',
  color_drop: 'st6',
  color_scheduled: 'st25',
  color_hw: 'st3',
  color_arrow: 'st16',
  text_bearing: '94&#x00B0;',
  color_gf: 'st4',
  color_ubat: 'st3',
  color_bt2: 'st3',
  color_bt1: 'st3',
  text_gf: 'OK',
  color_flow: 'st3',
  color_wavecolor: 'st0',
  text_amps: '0.0',
  color_amps: 'st5',
  color_dvl: 'st4',
  text_gpsago: '32m ago',
  text_cellago: 'over 4 days ago',
  text_notetime: '',
  color_bat1: 'st4',
  text_arrow: '94',
  color_bat3: 'st4',
  color_bat2: 'st4',
  color_bat5: 'st11',
  color_bat4: 'st11',
  color_bat7: 'st11',
  color_bat6: 'st11',
  color_cart: 'st18',
  color_bat8: 'st11',
  color_thrust: 'st4',
  text_sat: '14:03',
  text_logtime: '09:55',
  text_mission: 'trackPatch_yoyo - 13:57 &#x2022; 10Jun22',
  color_leak: 'st18',
  text_reckondistance: '4.7km in 1.6h',
  text_criticaltime: '',
  text_gftime: '5h 55m ago',
  text_thrusttime: '3.0km/hr',
  text_logago: '4h 34m ago',
  color_bigcable: 'st18',
  color_cartcircle: 'st18',
  text_scheduled: 'SCHEDULED: trackPatch_yoyo',
  text_lastupdate: '14:30',
  color_missiondefault: 'st25',
  text_volts: '14.6',
  color_volts: 'st5',
}

const server = setupServer(
  rest.get('/custom/widget/auv_brizo.json', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const MockVehicleList: React.FC = () => {
  const query = useVehicleInfo(
    { name: 'brizo' },
    axios.create({
      baseURL: '/custom',
      timeout: 5000,
    })
  )
  return query.isLoading ? null : (
    <div data-testid="result">
      {query.data?.text_vehicle ?? 'No vehicle found'}
    </div>
  )
}

describe('useVehicleInfo', () => {
  it('should render the vehicle name from the response', async () => {
    render(
      <MockProviders queryClient={new QueryClient()}>
        <MockVehicleList />
      </MockProviders>
    )
    await waitFor(() => {
      return screen.getByText(mockResponse.text_vehicle)
    })

    expect(screen.queryByText(mockResponse.text_vehicle)).toHaveTextContent(
      mockResponse.text_vehicle
    )
  })
})
