import '@testing-library/jest-dom'
import filterDocuments from './filterDocuments'

export const mockResponse = [
  // Unattached Example
  {
    docId: 5,
    name: 'CANON (Fall 2013) Tethys Mission Plan',
    docType: 'NORMAL',
    latestRevision: {
      docInstanceId: 7,
      unixTime: 1376422716933,
    },
  },
  // Deployment Example
  {
    docId: 4,
    name: 'Testing',
    docType: 'NORMAL',
    latestRevision: {
      docInstanceId: 5,
      unixTime: 1376422016104,
    },
    deploymentBriefs: [
      {
        deploymentId: 2,
        name: '(dash test) Test deployment',
      },
    ],
  },
  {
    docId: 3,
    name: 'Docs',
    docType: 'HELP',
    latestRevision: {
      docInstanceId: 4,
      unixTime: 1375814408071,
    },
  },
  // Vehicle Name Example
  {
    docId: 33,
    name: 'Tethys Docs',
    docType: 'HELP',
    vehicleNames: ['tethys'],
    latestRevision: {
      docInstanceId: 4,
      unixTime: 1375814408071,
    },
  },
  // Form Example
  {
    docId: 2,
    name: 'ZZ(old)_LRAUV Deployment Checklist',
    docType: 'FORM',
    latestRevision: {
      docInstanceId: 3000837,
      unixTime: 1481748345019,
    },
  },
  // Template Example
  {
    docId: 1,
    name: 'Watchbill Template',
    docType: 'TEMPLATE',
    latestRevision: {
      docInstanceId: 1,
      unixTime: 1375752851392,
    },
  },
]

describe('filterDocuments', () => {
  test('should filter documents by vehicle', async () => {
    const results = mockResponse.filter((doc) =>
      filterDocuments({
        doc,
        type: 'This Vehicle',
        vehicleName: 'Tethys',
      })
    )
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Tethys Docs')
  })

  test('should filter documents by deployment', async () => {
    const results = mockResponse.filter((doc) =>
      filterDocuments({
        doc,
        type: 'By Deployment',
        deploymentId: '2',
      })
    )
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Testing')
  })

  test('should filter documents unattached', async () => {
    const results = mockResponse.filter((doc) =>
      filterDocuments({
        doc,
        type: 'Unattached',
      })
    )
    expect(results.length).toBe(2)
    expect(results[0].name).toBe('CANON (Fall 2013) Tethys Mission Plan')
  })

  test('should filter documents by form', async () => {
    const results = mockResponse.filter((doc) =>
      filterDocuments({
        doc,
        type: 'Forms',
      })
    )
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('ZZ(old)_LRAUV Deployment Checklist')
  })

  test('should filter documents by template', async () => {
    const results = mockResponse.filter((doc) =>
      filterDocuments({
        doc,
        type: 'Templates',
      })
    )
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Watchbill Template')
  })

  test('should return all documents when not filtering', async () => {
    const results = mockResponse.filter((doc) =>
      filterDocuments({
        doc,
        type: 'All Documents',
      })
    )
    expect(results.length).toBe(mockResponse.length)
  })
})
