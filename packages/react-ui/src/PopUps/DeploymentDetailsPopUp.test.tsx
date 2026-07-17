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
  onChangeGitTag: (gitTag) => {
    console.log('updated tag', gitTag)
  },
  onSetDeploymentEventToCurrentTime: (event) => {
    console.log(event)
  },
  open: true,
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
    /mark recover time now button/i
  )

  expect(markRecoveryTimeButton).toBeInTheDocument()
})

test('should reset to quick-pick view when re-entering edit mode after choosing Custom date', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  // Enter edit mode, open the custom picker
  fireEvent.click(screen.getByLabelText(/edit dates button/i))
  fireEvent.click(screen.getByLabelText(/pick a custom start date/i))
  expect(screen.getByText(/← Back to quick options/i)).toBeInTheDocument()

  // Close edit mode (simulates Cancel / X button) by clicking the Cancel button
  fireEvent.click(screen.getByText(/^Cancel$/i))

  // Re-enter edit mode — should be back at quick-pick, not the DateField
  fireEvent.click(screen.getByLabelText(/edit dates button/i))
  expect(screen.getByLabelText(/set start time to now/i)).toBeInTheDocument()
  expect(screen.queryByText(/← Back to quick options/i)).not.toBeInTheDocument()
})

test('should call onSaveChanges (not onSetDeploymentEventToCurrentTime) when mark start time now is clicked in display mode', async () => {
  const onSaveChanges = jest.fn()
  const onSetDeploymentEventToCurrentTime = jest.fn()
  render(
    <DeploymentDetailsPopUp
      {...props}
      startDate={undefined}
      onSaveChanges={onSaveChanges}
      onSetDeploymentEventToCurrentTime={onSetDeploymentEventToCurrentTime}
    />
  )

  fireEvent.click(screen.getByLabelText(/mark start time now button/i))

  expect(onSaveChanges).toHaveBeenCalledTimes(1)
  expect(onSetDeploymentEventToCurrentTime).not.toHaveBeenCalled()
})

test('should restore pre-custom-picker startDate when Back is clicked', async () => {
  const onSaveChanges = jest.fn()
  const originalDate = '2022-06-30T11:29:42.598-07:00'
  render(
    <DeploymentDetailsPopUp
      {...props}
      startDate={originalDate}
      onSaveChanges={onSaveChanges}
    />
  )

  // Enter edit mode and open the custom picker (snapshots originalDate to ref)
  fireEvent.click(screen.getByLabelText(/edit dates button/i))
  fireEvent.click(screen.getByLabelText(/pick a custom start date/i))

  // Navigate back without saving — ref should restore the original value
  fireEvent.click(screen.getByText(/← Back to quick options/i))

  // Save from the quick-pick view — should send the original date, not a modified one
  fireEvent.click(screen.getByText(/^Save Changes$/i))

  expect(onSaveChanges).toHaveBeenCalledTimes(1)
  expect(onSaveChanges.mock.calls[0][0].startDate).toBe(originalDate)
})

test('should display quick-pick buttons for start when edit dates is clicked', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  fireEvent.click(screen.getByLabelText(/edit dates button/i))

  expect(screen.getByLabelText(/set start time to now/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/pick a custom start date/i)).toBeInTheDocument()
  expect(
    screen.queryByLabelText(/set start time to one hour from now/i)
  ).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/edit dates button/i)).not.toBeInTheDocument()
})

test('should save and exit edit mode immediately when Now is clicked', async () => {
  const onSaveChanges = jest.fn()
  render(<DeploymentDetailsPopUp {...props} onSaveChanges={onSaveChanges} />)

  fireEvent.click(screen.getByLabelText(/edit dates button/i))
  fireEvent.click(screen.getByLabelText(/set start time to now/i))

  expect(onSaveChanges).toHaveBeenCalledTimes(1)
  expect(screen.getByLabelText(/edit dates button/i)).toBeInTheDocument()
  expect(
    screen.queryByLabelText(/set start time to now/i)
  ).not.toBeInTheDocument()
})

test('should show DateField after clicking Custom date in start quick-pick', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  fireEvent.click(screen.getByLabelText(/edit dates button/i))
  fireEvent.click(screen.getByLabelText(/pick a custom start date/i))

  const startDateSelector = screen.queryAllByLabelText('date picker')[0]
  expect(startDateSelector).toBeInTheDocument()
  expect(screen.getByText(/← Back to quick options/i)).toBeInTheDocument()
})

test('should show inline warning when existing start date is in the future', async () => {
  const futureDate = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()
  render(<DeploymentDetailsPopUp {...props} startDate={futureDate} />)

  expect(screen.getByText(/Start is in the future/i)).toBeInTheDocument()
})

test('should show inline warning in quick-pick view when existing start date is in the future', async () => {
  const futureDate = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()
  render(<DeploymentDetailsPopUp {...props} startDate={futureDate} />)

  fireEvent.click(screen.getByLabelText(/edit dates button/i))

  // quick-pick buttons should be visible and warning should appear below them
  expect(screen.getByLabelText(/set start time to now/i)).toBeInTheDocument()
  expect(screen.getAllByText(/Start is in the future/i).length).toBeGreaterThan(
    0
  )
})

test('should show inline warning in custom date view when start date is in the future', async () => {
  const futureDate = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()
  render(<DeploymentDetailsPopUp {...props} startDate={futureDate} />)

  fireEvent.click(screen.getByLabelText(/edit dates button/i))
  fireEvent.click(screen.getByLabelText(/pick a custom start date/i))

  // Custom DateField pre-populates with the existing future startDate,
  // so isCustomFuture should be true and the warning should appear.
  expect(screen.getByText(/Start is in the future/i)).toBeInTheDocument()
})

test('should still show DateField for non-start events in edit mode', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  fireEvent.click(screen.getByLabelText(/edit dates button/i))

  // start → quick-pick (no DateField); launch, recover, end → DateField = exactly 3
  const datePickers = screen.queryAllByLabelText('date picker')
  expect(datePickers).toHaveLength(3)
})

test('should display number of log files', async () => {
  render(<DeploymentDetailsPopUp {...props} />)

  expect(
    screen.queryByText(
      `DIRECTORY LIST (${props?.logFiles?.length} LOG FILE${
        props?.logFiles?.length !== 1 && 'S'
      })`
    )
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
