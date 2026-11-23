import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MissionModalView, MissionModalViewProps } from './MissionModalView'
import { RecoilRoot } from 'recoil'

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

const props: MissionModalViewProps = {
  currentStepIndex: 0,
  vehicleName: 'Brizo',
  unfilteredMissionParameters: [],
  missionCategories: [
    {
      id: 'Recent Runs',
      name: 'Recent Runs',
    },
    {
      id: 'Demo',
      name: 'Demo',
    },
    {
      id: 'Engineering',
      name: 'Engineering',
    },
    {
      id: 'Science',
      name: 'Science',
    },
  ],

  missions: [
    {
      id: '1',
      category: 'Science',
      name: 'sci2',
      note: 'Test mission',
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
      note: 'Mission 2',
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
      note: 'Profile station at C1 for the night',
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
  onSelectMission: () => console.log('selected'),
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
  defaultOverrides: [
    {
      description:
        '\n        Transit surface communications. Elapsed time after previous surface\n        comms when vehicle will begin to ascend for additional surface\n        communications\n    ',
      name: 'SurfaceComms',
      unit: 'minute',
      value: '45',
      overrideValue: '35',
    },
  ],
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
  expect(() =>
    render(
      <RecoilRoot>
        <MissionModalView {...props} />
      </RecoilRoot>
    )
  ).not.toThrow()
})

// Mission: Step 1 tests
test('should display mission tasks', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.missions[0].note ?? '')).toBeInTheDocument()
})

test('should display mission category and name labels', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} />
    </RecoilRoot>
  )
  const { category, name } = props.missions[0]
  expect(screen.queryByText(`${category}: ${name}`)).toBeInTheDocument()
})

test('should display mission descriptions', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} />
    </RecoilRoot>
  )
  expect(
    screen.queryByText(`${props.missions[0].description}`)
  ).toBeInTheDocument()
})

test('should not display missions that do not match the current category filter', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} />
    </RecoilRoot>
  )
  expect(
    screen.queryByText(`${props.missions[2].description}`)
  ).not.toBeInTheDocument()
})

test('should display vehicle name in teal', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} />
    </RecoilRoot>
  )
  expect(screen.queryByTestId(/vehicle name/i)).toHaveClass('text-teal-500')
})

// Waypoints: Step 2 tests
test('should display mission name in teal', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={1} />
    </RecoilRoot>
  )
  expect(screen.queryByTestId(/mission name/i)).toHaveClass('text-teal-500')
})

test('should display number of available waypoint to set up and vehicle name', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={1} />
    </RecoilRoot>
  )
  expect(
    screen.queryByText(/Set up to 2 waypoints for Brizo\'s/i)
  ).toBeInTheDocument()
})

test('should display stat labels', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={1} />
    </RecoilRoot>
  )
  expect(screen.queryByText(/total distance/i)).toBeInTheDocument()
  expect(screen.queryByText(/est. bottom depth/i)).toBeInTheDocument()
  expect(screen.queryByText(/est. duration/i)).toBeInTheDocument()
})

test('should display NaN all and Reset all buttons', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={1} />
    </RecoilRoot>
  )
  expect(screen.queryByText(/NaN all/i)).toBeInTheDocument()
  expect(screen.queryByText(/Reset all/i)).toBeInTheDocument()
})

test('should display Waypoint Summary when Next button is clicked after selecting waypoints', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={1} />
    </RecoilRoot>
  )
  const nextButton = screen.getByRole('button', { name: 'Next' })
  fireEvent.click(nextButton)

  expect(screen.queryByText(/Summary of Waypoints/i)).toBeInTheDocument()
})

// Parameters: Step 3 tests
test('should display parameter names', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={2} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.parameters[0].name)).toBeInTheDocument()
})

test('should display parameter descriptions', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={2} />
    </RecoilRoot>
  )
  const descriptWithBreaks = props.parameters[0]?.description
  const descript = descriptWithBreaks?.replace('\n', '').trim()

  expect(screen.queryByText(`${descript}`)).toBeInTheDocument()
})

test('should display default values', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={2} />
    </RecoilRoot>
  )
  // test assumes value !== 1 and adds 's' to unit
  const defaultValue = `${props.parameters[0].value} ${props.parameters[0]?.unit}s`
  expect(screen.queryByText(defaultValue)).toBeInTheDocument()
})

test('should display Parameters Summary when Next button is clicked after selecting parameterss', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={2} />
    </RecoilRoot>
  )
  const nextButton = screen.getByRole('button', { name: 'Next' })
  fireEvent.click(nextButton)

  expect(screen.queryByText(/Summary of overrides/i)).toBeInTheDocument()
})

test('should return to Parameters Summary (not Parameters form) when Back is clicked from Safety & Comms', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={3} />
    </RecoilRoot>
  )
  // Navigate back from Safety & Comms (step 3) → should land on Parameters Summary
  const backButton = screen.getByRole('button', { name: 'Back' })
  fireEvent.click(backButton)

  expect(screen.queryByText(/Summary of overrides/i)).toBeInTheDocument()
})

// Safety and Comms Parameters: Step 4 tests
test('should display safety parameter names', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={3} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.safetyParams[0].name)).toBeInTheDocument()
})

test('should display comms parameter names', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={3} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.commsParams[0].name)).toBeInTheDocument()
})

test('should display safety parameter default values', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={3} />
    </RecoilRoot>
  )
  // test assumes value !== 1 and adds 's' to unit
  const defaultValue = `${props.safetyParams[0].value} ${props.safetyParams[0]?.unit}s`
  expect(screen.queryByText(defaultValue)).toBeInTheDocument()
})

test('should display comms parameter default values', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={3} />
    </RecoilRoot>
  )
  // test assumes value !== 1 and adds 's' to unit
  const defaultValue = `${props.commsParams[0].value} ${props.commsParams[0]?.unit}s`
  expect(screen.queryByText(defaultValue)).toBeInTheDocument()
})

// Review: Step 4 tests
test('should display review mission summary', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={4} />
    </RecoilRoot>
  )
  expect(
    screen.queryByText('Review mission summary: 1 waypoint and 1 override')
  ).toBeInTheDocument()
})

test('should display safety parameters', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={4} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.safetyParams[0].name)).toBeInTheDocument()
})

test('should display comms parameters', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={4} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.commsParams[0].name)).toBeInTheDocument()
})

test('should display only mission parameters with overrides', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={4} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.parameters[1].name)).toBeInTheDocument()
  expect(screen.queryByText(props.parameters[0].name)).not.toBeInTheDocument()
})

test('should display safety parameters', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={4} />
    </RecoilRoot>
  )
  expect(screen.queryByText(props.safetyParams[0].name)).toBeInTheDocument()
})

test('should display only plotted waypoints (i.e. ones that do not have NaN as a value)', async () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={4} />
    </RecoilRoot>
  )
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

// Confirm & Send close button (×) dismisses the modal
test('Confirm & Send close button dismisses the modal', () => {
  const onCancel = jest.fn()
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        previewText={'sched asap "load Science/sci2.tl;run"'}
        onCancel={onCancel}
      />
    </RecoilRoot>
  )
  fireEvent.click(screen.getByRole('button', { name: 'close' }))
  expect(onCancel).toHaveBeenCalledTimes(1)
})

// Confirm & Send: vehicle radio fix
test('Confirm & Send: No radio stays checked after clicking it', () => {
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        vehicles={['Brizo', 'Triton']}
      />
    </RecoilRoot>
  )
  const noRadio = screen.getByRole('radio', { name: /no, send to:/i })
  fireEvent.click(noRadio)
  expect(noRadio).toBeChecked()
})

test('Confirm & Send: Send button disabled when No radio chosen without selecting a vehicle', () => {
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        vehicles={['Brizo', 'Triton']}
      />
    </RecoilRoot>
  )
  fireEvent.click(screen.getByRole('radio', { name: /no, send to:/i }))
  // Send button should be disabled until a different vehicle is chosen
  const sendButton = screen.getByRole('button', { name: /^send to/i })
  expect(sendButton).toBeDisabled()
})

// Confirm & Send: preview refetch when schedule options change
test('Confirm & Send: onSchedule called with preview=true when comm type changes', () => {
  const onSchedule = jest.fn()
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        selectedId="1"
        onSchedule={onSchedule}
      />
    </RecoilRoot>
  )
  onSchedule.mockClear() // clear the initial preview fetch on mount
  // Use exact name to avoid matching the "cellsat" label which also contains "send via sat"
  const satRadio = screen.getByRole('radio', { name: 'Send via sat' })
  fireEvent.click(satRadio)
  expect(onSchedule).toHaveBeenCalledWith(
    expect.objectContaining({ preview: true, commType: 'sat' })
  )
})

// SBD chunk note hides for single-part previews on Confirm & Send
test('hides SBD chunk note for single-part previews on Confirm & Send', () => {
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        previewText={'sched asap "load Science/sci2.tl;run"'}
        previewSbdCount={1}
      />
    </RecoilRoot>
  )
  expect(screen.queryByText(/SBD chunk/i)).not.toBeInTheDocument()
})

// Confirm & Send: Step 5 (collapsed)
test('renders ConfirmAndSendStep with vehicle selector on step 5', () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={5} />
    </RecoilRoot>
  )
  expect(screen.getByText(/send to vehicle/i)).toBeInTheDocument()
})

test('Confirm & Send shows SBD chunk note when count >= 2', () => {
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        previewText={'sched asap "load Science/sci2.tl;run"'}
        previewSbdCount={3}
      />
    </RecoilRoot>
  )
  expect(
    screen.getByText('(This will be sent as 3 SBD chunks)')
  ).toBeInTheDocument()
})

test('Confirm & Send Cancel dismisses the modal', () => {
  const onCancel = jest.fn()
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={5} onCancel={onCancel} />
    </RecoilRoot>
  )
  fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }))
  expect(onCancel).toHaveBeenCalledTimes(1)
})

test('Confirm & Send Back returns to Review step', () => {
  const onCancel = jest.fn()
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={5} onCancel={onCancel} />
    </RecoilRoot>
  )
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(onCancel).not.toHaveBeenCalled()
  // Review step shows waypoint/override count summary
  expect(screen.queryByText(/Review mission summary/i)).toBeInTheDocument()
})

// Bug 1 fix: step progress bar shows all steps including Confirm & Send on every step
test('step progress bar shows Confirm & Send on step 0', () => {
  render(
    <RecoilRoot>
      <MissionModalView {...props} currentStepIndex={0} />
    </RecoilRoot>
  )
  // StepProgress renders each label as "N. Label" twice (hidden + visible span)
  expect(screen.getAllByText(/Confirm & Send/).length).toBeGreaterThan(0)
})

// Bug 2 fix: preview fetched on first mount at Confirm & Send (Send Again opens here directly)
test('Confirm & Send: onSchedule called with preview=true on initial mount (Send Again scenario)', () => {
  const onSchedule = jest.fn()
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        selectedId="1"
        onSchedule={onSchedule}
      />
    </RecoilRoot>
  )
  expect(onSchedule).toHaveBeenCalledWith(
    expect.objectContaining({ preview: true })
  )
})

// Bug 2 fix: preview re-fetched when navigating back to change parameters and returning,
// and edited state (e.g. commType) is preserved in the re-fetch payload
test('Confirm & Send: onSchedule called with preview=true when re-entering after navigating back, with edited state preserved', () => {
  const onSchedule = jest.fn()
  render(
    <RecoilRoot>
      <MissionModalView
        {...props}
        currentStepIndex={5}
        selectedId="1"
        onSchedule={onSchedule}
      />
    </RecoilRoot>
  )
  // Change comm type to sat before navigating away
  fireEvent.click(screen.getByRole('radio', { name: 'Send via sat' }))
  onSchedule.mockClear() // clear calls so far

  // Navigate back to Review
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))

  // Return to Confirm & Send via Review's Next button
  fireEvent.click(screen.getByRole('button', { name: /Next/i }))

  // Preview re-fired with the edited commType preserved
  expect(onSchedule).toHaveBeenCalledWith(
    expect.objectContaining({ preview: true, commType: 'sat' })
  )
})
