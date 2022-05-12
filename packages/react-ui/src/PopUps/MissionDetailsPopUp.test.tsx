import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  MissionDetailsPopUp,
  MissionDetailsPopUpProps,
} from './MissionDetailsPopUp'

const props: MissionDetailsPopUpProps = {
  overrides: [
    {
      headerLabel: 'TEST HEADER',
      values: [{ name: 'test override', value: 'override value' }],
    },
  ],
  missionDetails: [{ name: 'test mission', value: 'mission value' }],
  missionId: 1,
  missionStatus: 'waiting',
  missionName: 'sci2',
  commandName: 'circles!',
  vehicle: 'Brizo',
  onLog: (missionId) => {
    console.log(missionId)
  },
}

test('should render override names and values', async () => {
  render(<MissionDetailsPopUp {...props} />)

  const testOverride = props.overrides[0].values[0]

  expect(screen.queryByText(`${testOverride.name}`)).toBeInTheDocument()
  expect(screen.queryByText(`${testOverride.value}`)).toBeInTheDocument()
})

test('should render override header label followed by the number of values associated with the override ', async () => {
  render(<MissionDetailsPopUp {...props} />)

  const headerLabel = props.overrides[0].headerLabel

  expect(screen.queryByText(`${headerLabel} (1)`)).toBeInTheDocument()
})

test('should render mission names and values', async () => {
  render(<MissionDetailsPopUp {...props} />)

  const testMission = props.missionDetails[0]

  expect(screen.queryByText(`${testMission.name}`)).toBeInTheDocument()
  expect(screen.queryByText(`${testMission.value}`)).toBeInTheDocument()
})

test('should render the component', async () => {
  expect(() => render(<MissionDetailsPopUp {...props} />)).not.toThrow()
})

test('should render mission name', async () => {
  render(<MissionDetailsPopUp {...props} />)

  expect(screen.queryByText(props.missionName)).toBeInTheDocument()
})

test('should render command name', async () => {
  render(<MissionDetailsPopUp {...props} />)

  expect(screen.queryByText(props.commandName)).toBeInTheDocument()
})

test('should render queue text when provided', async () => {
  const queueText = 'queue test'
  render(<MissionDetailsPopUp {...props} queue={queueText} />)

  expect(screen.queryByText(queueText)).toBeInTheDocument()
})

test('should render transmission text when provided', async () => {
  const transmissionText = 'transmission test'
  render(
    <MissionDetailsPopUp
      {...props}
      missionStatus={'in progress'}
      transmission={transmissionText}
    />
  )

  expect(screen.queryByText(transmissionText)).toBeInTheDocument()
})

test('should render acknowledge text when provided', async () => {
  const acknowledgeText = 'acknowledge test'
  render(<MissionDetailsPopUp {...props} acknowledge={acknowledgeText} />)

  expect(screen.queryByText(acknowledgeText)).toBeInTheDocument()
})

test('should render vehicle name in acknowledge label when provided', async () => {
  const acknowledgeText = 'acknowledge test'
  render(<MissionDetailsPopUp {...props} acknowledge={acknowledgeText} />)

  expect(
    screen.queryByText(`Acknowledged by ${props.vehicle}:`)
  ).toBeInTheDocument()
})

test('should render appropriate mission status and start time labels when status is waiting', async () => {
  render(
    <MissionDetailsPopUp
      {...props}
      missionStatus={'waiting'}
      startTime={'test start time'}
    />
  )

  expect(screen.queryByText('Waiting to')).toBeInTheDocument()
  expect(screen.queryByText('transmit')).toBeInTheDocument()
  expect(screen.queryByText('Est. Start:')).toBeInTheDocument()
})

test('should render appropriate mission status label when status is in progress', async () => {
  render(<MissionDetailsPopUp {...props} missionStatus={'in progress'} />)

  expect(screen.queryByText(/in progress/i)).toBeInTheDocument()
})

test('should render appropriate mission status and table header labels when status is completed', async () => {
  render(<MissionDetailsPopUp {...props} missionStatus={'completed'} />)

  expect(screen.queryByText(/completed/i)).toBeInTheDocument()
  expect(screen.queryByText(/summary/i)).toBeInTheDocument()
})
