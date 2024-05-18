import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getPlatforms, GetPlatformsParams } from './getPlatforms'

let params: GetPlatformsParams = { refresh: 'y' }

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

const server = setupServer(
  rest.get('/trackdb/platforms', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getPlatforms', () => {
  // Test for the actual API call
  it('should return the mocked response when successful', async () => {
    const response = await getPlatforms(params)
    expect(response).toEqual(mockResponse)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.get('', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await getPlatforms(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
