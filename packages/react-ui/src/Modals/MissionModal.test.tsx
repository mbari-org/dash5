import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionModal, MissionModalProps } from './MissionModal'

jest.mock('../assets/ruler-dark.png', () => {
  return {
    default: 'fake.png',
  }
})

jest.mock('../assets/ruler-light.png', () => {
  return {
    default: 'fake.png',
  }
})

const props: MissionModalProps = {
  currentIndex: 0,
  vehicleName: 'Brizo',
  missionCategories: [
    {
      id: 'Recent Runs',
      name: 'Recent Runs',
    },
    {
      id: '2',
      name: 'Demo',
    },
    {
      id: '3',
      name: 'Engineering',
    },
  ],

  missions: [
    {
      id: '1',
      category: 'Science',
      name: 'sci2',
      task: 'Test mission',
      description:
        "Vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Brizo',
      ranBy: 'Jordan Caress',
      ranOn: 'Dec. 10, 2021',
      waypointCount: 2,
      recentRun: true,
    },
    {
      id: '2',
      category: 'Maintenance',
      name: 'sci2',
      task: 'Mission 2',
      description:
        "Another mission where a vehicle yo-yo's to the specified waypoints, with science turned on.",
      vehicle: 'Tethys',
      ranBy: 'Joost Daniels',
      ranOn: 'Dec. 10, 2021',
      waypointCount: 4,
      recentRun: true,
    },
    {
      id: '3',
      category: 'Science',
      name: 'profile_station',
      task: 'Profile station at C1 for the night',
      description:
        'This mission yoyos in a circle around a specified location.',
      vehicle: 'Tethys',
      ranBy: 'Ben Ranaan',
      ranOn: 'Dec. 10, 2021',
      ranAt: 'C1',
    },
  ],

  onCancel: () => console.log('cancel'),
  onSchedule: () => console.log('scheduled'),
  waypoints: [
    {
      latName: 'Lat1',
      lonName: 'Lon1',
      lat: '33.333',
      lon: '-141.111',
      description:
        'Latitude of 1st waypoint. If NaN, waypoint will be skipped/Longitude of 1st waypoint.',
    },
    {
      latName: 'Lat2',
      lonName: 'Lon2',
      lat: 'NaN',
      lon: 'NaN',
      description:
        'Latitude of 2nd waypoint. If NaN, waypoint will be skipped/Longitude of 2nd waypoint.',
    },
  ],
  stations: [
    { name: 'C1', lat: '36.797', lon: '-121.847' },
    { name: 'C2', lat: '46.797', lon: '-141.847' },
  ],
  onFocusWaypoint: (index) => {
    console.log(index)
  },
  parameters: [
    {
      description: '\n        Maximum duration of mission\n    ',
      name: 'MissionTimeout',
      unit: 'hour',
      value: '24',
    },
    {
      description:
        '\n        Transit surface communications. Elapsed time after previous surface\n        comms when vehicle will begin to ascend for additional surface\n        communications\n    ',
      name: 'SurfaceComms',
      unit: 'minute',
      value: '45',
      overrideValue: '35',
    },
  ],
  commsParams: [
    {
      description: '\n        How often to surface for communications\n    ',
      name: 'NeedCommsTime',
      unit: 'minute',
      value: '60',
    },
    {
      description:
        '\n        Elapsed time after most recent surfacing when vehicle will\n        begin to ascend to the surface again. The timing is actually...\n',
      name: 'DiveInterval',
      unit: 'hour',
      value: '3',
    },
  ],
  safetyParams: [
    {
      description: '\n        Maximum duration of mission\n    ',
      name: 'MaxDuration',
      unit: 'hour',
      value: '2',
    },
    {
      description: '\n        Maximum allowable depth during the mission\n    ',
      name: 'MaxDepth',
      unit: 'meter',
      value: '200',
    },
  ],
}

test('should render the component', async () => {
  expect(() => render(<MissionModal {...props} />)).not.toThrow()
})

// Mission: Step 1 tests
test('should display mission tasks', async () => {
  render(<MissionModal {...props} />)
  expect(screen.queryByText(props.missions[0].task ?? '')).toBeInTheDocument()
})

test('should display mission category and name labels', async () => {
  render(<MissionModal {...props} />)
  const { category, name } = props.missions[0]
  expect(screen.queryByText(`${category}: ${name}`)).toBeInTheDocument()
})

test('should display mission descriptions', async () => {
  render(<MissionModal {...props} />)
  expect(
    screen.queryByText(`${props.missions[0].description}`)
  ).toBeInTheDocument()
})

test('should not display missions that do not match the current category filter', async () => {
  render(<MissionModal {...props} />)
  expect(
    screen.queryByText(`${props.missions[2].description}`)
  ).not.toBeInTheDocument()
})

test('should display vehicle name in teal', async () => {
  render(<MissionModal {...props} />)
  expect(screen.queryByTestId(/vehicle name/i)).toHaveClass('text-teal-500')
})

// Waypoints: Step 2 tests
test('should display mission name in teal', async () => {
  render(<MissionModal {...props} currentIndex={1} />)
  expect(screen.queryByTestId(/mission name/i)).toHaveClass('text-teal-500')
})

test('should display number of available waypoint to set up and vehicle name', async () => {
  render(<MissionModal {...props} currentIndex={1} />)
  expect(
    screen.queryByText(/Set up to 2 waypoints for Brizo\'s/i)
  ).toBeInTheDocument()
})

test('should display stat labels', async () => {
  render(<MissionModal {...props} currentIndex={1} />)
  expect(screen.queryByText(/total distance/i)).toBeInTheDocument()
  expect(screen.queryByText(/est. bottom depth/i)).toBeInTheDocument()
  expect(screen.queryByText(/est. duration/i)).toBeInTheDocument()
})

test('should display NaN all and Reset all buttons', async () => {
  render(<MissionModal {...props} currentIndex={1} />)
  expect(screen.queryByText(/NaN all/i)).toBeInTheDocument()
  expect(screen.queryByText(/Reset all/i)).toBeInTheDocument()
})

test('should display Waypoint Summary when Next button is clicked after selecting waypoints', async () => {
  render(<MissionModal {...props} currentIndex={1} />)
  const nextButton = screen.getByRole('button', { name: 'Next' })
  fireEvent.click(nextButton)

  expect(screen.queryByText(/Summary of Waypoints/i)).toBeInTheDocument()
})

// Parameters: Step 3 tests
test('should display parameter names', async () => {
  render(<MissionModal {...props} currentIndex={2} />)
  expect(screen.queryByText(props.parameters[0].name)).toBeInTheDocument()
})

test('should display parameter descriptions', async () => {
  render(<MissionModal {...props} currentIndex={2} />)
  const descriptWithBreaks = props.parameters[0]?.description
  const descript = descriptWithBreaks?.replace('\n', '').trim()

  expect(screen.queryByText(`${descript}`)).toBeInTheDocument()
})

test('should display default values', async () => {
  render(<MissionModal {...props} currentIndex={2} />)
  // test assumes value !== 1 and adds 's' to unit
  const defaultValue = `${props.parameters[0].value} ${props.parameters[0]?.unit}s`
  expect(screen.queryByText(defaultValue)).toBeInTheDocument()
})

test('should display Parameters Summary when Next button is clicked after selecting parameterss', async () => {
  render(<MissionModal {...props} currentIndex={2} />)
  const nextButton = screen.getByRole('button', { name: 'Next' })
  fireEvent.click(nextButton)

  expect(screen.queryByText(/Summary of overrides/i)).toBeInTheDocument()
})

// Safety and Comms Parameters: Step 4 tests
test('should display safety parameter names', async () => {
  render(<MissionModal {...props} currentIndex={3} />)
  expect(screen.queryByText(props.safetyParams[0].name)).toBeInTheDocument()
})

test('should display comms parameter names', async () => {
  render(<MissionModal {...props} currentIndex={3} />)
  expect(screen.queryByText(props.commsParams[0].name)).toBeInTheDocument()
})

test('should display safety parameter default values', async () => {
  render(<MissionModal {...props} currentIndex={3} />)
  // test assumes value !== 1 and adds 's' to unit
  const defaultValue = `${props.safetyParams[0].value} ${props.safetyParams[0]?.unit}s`
  expect(screen.queryByText(defaultValue)).toBeInTheDocument()
})

test('should display comms parameter default values', async () => {
  render(<MissionModal {...props} currentIndex={3} />)
  // test assumes value !== 1 and adds 's' to unit
  const defaultValue = `${props.commsParams[0].value} ${props.commsParams[0]?.unit}s`
  expect(screen.queryByText(defaultValue)).toBeInTheDocument()
})

// Review: Step 4 tests
test('should display review mission summary', async () => {
  render(<MissionModal {...props} currentIndex={4} />)
  expect(
    screen.queryByText('Review mission summary: 1 waypoint and 1 override')
  ).toBeInTheDocument()
})

test('should display safety parameters', async () => {
  render(<MissionModal {...props} currentIndex={4} />)
  expect(screen.queryByText(props.safetyParams[0].name)).toBeInTheDocument()
})

test('should display comms parameters', async () => {
  render(<MissionModal {...props} currentIndex={4} />)
  expect(screen.queryByText(props.commsParams[0].name)).toBeInTheDocument()
})

test('should display only mission parameters with overrides', async () => {
  render(<MissionModal {...props} currentIndex={4} />)
  expect(screen.queryByText(props.parameters[1].name)).toBeInTheDocument()
  expect(screen.queryByText(props.parameters[0].name)).not.toBeInTheDocument()
})

test('should display only plotted waypoints (i.e. ones that do not have NaN as a value)', async () => {
  render(<MissionModal {...props} currentIndex={4} />)
  expect(
    screen.queryByText(
      `${props.waypoints[0].latName}/${props.waypoints[0].lonName}`
    )
  ).toBeInTheDocument()
  expect(
    screen.queryByText(
      `${props.waypoints[1].latName}/${props.waypoints[1].lonName}`
    )
  ).not.toBeInTheDocument()
})
