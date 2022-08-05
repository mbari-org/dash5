import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { createDocument, CreateDocumentParams } from './createDocument'

let params: CreateDocumentParams = {
  name: 'example',
  docType: 'TEMPLATE',
  text: 'example',
}

export const mockResponse = {
  result: {
    docId: 3000788,
    docName: 'Pontus 24 Fishcam - Deployment Plan',
    docInstanceId: 3004094,
    unixTime: 1656376737014,
    email: 'hobson@mbari.org',
    text: '<div>Pontus 24 - Deployment Plan</div><div><br></div><div>Description: Attempt to film salmon.</div><div><br></div><div>Missions:&nbsp;</div><div>Start at the head of Soquel Canyon and head back towards ML along the shelf break.&nbsp; YoYo down to 33m</div><div><pre class="runData" style="color: rgb(128, 0, 128);">Sched asap "load Science/sci2.xml;\nset sci2.MissionTimeout 8 h;\nset sci2.Lat1 36.869963 degree;\nset sci2.Lon1 -121.965980 degree;\nset sci2.Lat2 36.845502 degree;\nset sci2.Lon2 -121.952840 degree;\nset sci2.Lat3 36.825555 degree" 4b3t8 1 3</pre><pre class="runData" style="color: rgb(128, 0, 128);">sched asap "set sci2.Lon3 -121.967314 degree;\nset sci2.Lat4 36.799664 degree;\nset sci2.Lon4 -121.974810 degree;\nset sci2.Lat5 36.804487 degree;\nset sci2.Lon5 -121.912504 degree;\nset sci2.Lat6 36.807334 degree;\nset sci2.Lon6 -121.864658 degree" 4b3t8 2 3</pre><pre class="runData" style="color: rgb(128, 0, 128);">sched asap "set sci2.Lat7 36.797024 degree;\nset sci2.Lon7 -121.826800 degree;\nset sci2.YoYoMaxDepth 33 m;\nrun" 4b3t8 3 3</pre></div><div><br></div><div>Waypoints:</div><div>C1&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;36.797&nbsp; &nbsp; -121.847</div><div><br></div><div>M1&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;36.750&nbsp; &nbsp; -122.022</div><div><br></div><div>N&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;36.9026&nbsp; &nbsp; -121.9636</div><div><br></div><div>S&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;36.6591&nbsp; &nbsp; -121.8934</div><div><br></div><div><br></div><div>&nbsp; &nbsp;&nbsp;</div><div>VHF 160.785 Mhz&nbsp; &nbsp;&nbsp;</div><div>&nbsp; &nbsp; &nbsp;&nbsp;</div><div>In the event of a watchdog reset:&nbsp; &nbsp; &nbsp;&nbsp;</div><div>&nbsp; &nbsp; &nbsp;</div><div>1.) issue command "restart sys"</div><div>2.) issue command "configSet list" to confirm&nbsp; persisted values are still persisted.</div><div>3.) confirm a clean start by looking for the log&nbsp; important message: "Reading configuration overrides from Data/persisted.cfg"&nbsp; &nbsp; &nbsp;&nbsp;</div><div>&nbsp; &nbsp; &nbsp; &nbsp;</div><div>To use the scheduler</div><div>&nbsp; &nbsp; &nbsp; &nbsp;</div><div>1.) Use the command "schedule list" to see what\'s in the schedule queue. "schedule clear" will clear it.&nbsp;</div><div>2.) Using the run button set mission parameters&nbsp; as normal. The "ASAP" radio box is checked under the "scheduling" menu (see below) by default. This will run&nbsp; the mission asap.&nbsp;</div><div>3.) To run a mission at a particular time, select&nbsp; the "At:" radio box and enter your date/time. Then send the commands to the vehicle.&nbsp;</div><div>4.) use the command "schedule list" and "schedule&nbsp; resume" at the end to make sure the queue is what you expect and to activate the queue.</div><div>5.) Note that a stopped mission for any reason (e.g. stop command, critical) will pause the scheduler. This will be reflected in the shore log. To resume the scheduler, type "schedule resume"&nbsp;</div>',
    user: 'Brett Hobson',
    docInstanceBriefs: [
      {
        docInstanceId: 3004094,
        unixTime: 1656376737014,
        user: 'Brett Hobson',
      },
      {
        docInstanceId: 3004093,
        unixTime: 1656376652459,
        user: 'Brett Hobson',
      },
      {
        docInstanceId: 3004091,
        unixTime: 1656376282467,
        user: 'Brett Hobson',
      },
    ],
  },
}

const server = setupServer(
  rest.post('/documents', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockResponse))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('createDocument', () => {
  it('should return the mocked value when successful', async () => {
    const response = await createDocument(params)
    expect(response).toEqual(mockResponse.result)
  })

  it('should throw when unsuccessful', async () => {
    server.use(
      rest.post('/documents', (_req, res, ctx) => {
        return res.once(ctx.status(500))
      })
    )

    try {
      await createDocument(params)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
