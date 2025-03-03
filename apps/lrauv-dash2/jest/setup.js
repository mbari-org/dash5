// Mocking as we can't run browser-based tests in the CI environment
// This is just a placeholder test to pass CI

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { deployment: ['daphne', '123'] },
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue({}),
  })),
}))

// Mock window.google.maps
global.google = {
  maps: {
    ElevationService: jest.fn().mockImplementation(() => ({
      getElevationForLocations: jest.fn().mockResolvedValue({}),
    })),
    LatLng: jest.fn(),
    Map: jest.fn(),
    Marker: jest.fn(),
  },
}

// Setup document for tests
global.document.body.innerHTML = '<div id="__next"></div>'
