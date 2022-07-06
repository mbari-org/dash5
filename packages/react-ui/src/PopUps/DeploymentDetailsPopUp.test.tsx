import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  DeploymentDetailsPopUp,
  DeploymentDetailsPopUpProps,
} from './DeploymentDetailsPopUp'
import { DateTime } from 'luxon'

const props: DeploymentDetailsPopUpProps = {
  name: 'Brizo 7 EcoHab',
  complete: false,
  gitTag: '2021-08-13',
  tagOptions: ['1980-04-25', '1981-07-21', '2016-12-10', '2019-06-24'].map(
    (tag) => ({ id: tag, name: tag })
  ),
  logFiles: ['20211210T045230', '20211210T045231'],
  directoryListFilepath:
    '/opt/brizodash/data/sim/missionlogs/2021/20211209_20211214.dlist',
  queueSize: 3,
  startDate: '2022-06-30T11:29:42.598-07:00',
  launchDate: '2022-07-05T11:28:52.637-07:00',
  onExpand: () => {
    console.log('expanded')
  },
  onSaveChanges: (savedDeployment) => {
    console.log(savedDeployment)
  },
  onSetDeploymentEventToCurrentTime: (event) => {
    console.log(event)
  },
}

test('should render the component', async () => {
  expect(() => render(<DeploymentDetailsPopUp {...props} />)).not.toThrow()
})

test('should display mission name', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(screen.queryByText(props.name)).toBeInTheDocument()
})

test('should display number of missions in queue', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(
    screen.queryByText(`${props.queueSize} missions in queue`)
  ).toBeInTheDocument()
})

test('should display provided git tag', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(screen.queryByText(`${props.gitTag}`)).toBeInTheDocument()
})

test('should display vehicle underwater icon when mission is in progress', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(
    screen.queryAllByLabelText(/vehicle underwater icon/gi)[0]
  ).toBeInTheDocument()
  expect(screen.queryByText(/In Progress/i)).toBeInTheDocument()
})

test('should display vehicle recovered icon when mission is completed', async () => {
  render(<DeploymentDetailsPopUp {...props} complete={true} />)

  expect(
    screen.queryAllByLabelText(/vehicle recovered icon/gi)[0]
  ).toBeInTheDocument()
  expect(screen.queryByText(/Complete/i)).toBeInTheDocument()
})

test('should display mission start date in UTC as default when provided', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  const startDateInUTC = DateTime.fromJSDate(new Date(`${props.startDate}`))
    .toUTC()
    .toLocaleString(DateTime.DATETIME_FULL)

  expect(screen.queryByText(`${startDateInUTC}`)).toBeInTheDocument()
})

test('should display mission start date in local time when selected', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  const localTimeButton = screen.getByLabelText(/local time button/i)

  fireEvent.click(localTimeButton)

  const startDateInLocal = DateTime.fromJSDate(
    new Date(`${props.startDate}`)
  ).toLocaleString(DateTime.DATETIME_FULL)

  expect(screen.queryByText(`${startDateInLocal}`)).toBeInTheDocument()
})

test('should display mark recovery time now button if a recovery time is not provided', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  const markRecoveryTimeButton = screen.queryByLabelText(
    /mark recovery time now button/i
  )

  expect(markRecoveryTimeButton).toBeInTheDocument()
})

test('should display date selectors if edit dates button is clicked', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  const editDateButton = screen.getByLabelText(/edit dates button/i)

  fireEvent.click(editDateButton)

  const startDateSelector = screen.queryAllByLabelText('date picker')[0]

  expect(startDateSelector).toBeInTheDocument()
  expect(screen.queryByLabelText(/edit dates button/i)).not.toBeInTheDocument()
})

test('should display number of log files', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(
    screen.queryByText(`DIRECTORY LIST (${props?.logFiles?.length} LOG FILES)`)
  ).toBeInTheDocument()
})

test('should display directory list filepath when provided', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(
    screen.queryByText(`${props.directoryListFilepath}`)
  ).toBeInTheDocument()
})

test('should display log files when provided', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(screen.queryByText(`${props.logFiles?.[0]}`)).toBeInTheDocument()
})
