import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleCommsCell, VehicleInfoCell } from '../Cells'
import { OverviewToolbar, OverviewToolbarProps } from './OverviewToolbar'

import { UnderwaterIcon, ConnectedIcon } from '../Icons'
import { DateTime } from 'luxon'

const props: OverviewToolbarProps = {
  deployment: {
    name: 'Brizo 7 EcoHab',
    id: '1',
    unixTime: DateTime.now().minus({ days: 3 }).toMillis(),
  },
  pics: ['Tanner P.'],
  onCalls: ['Brian K.'],
  currentUserName: 'Tanner P.',
  vehicleName: 'Brizo',
  deployments: [
    {
      id: '1',
      name: 'Brizo 7 Ecohab',
    },
    {
      id: '2',
      name: 'Brizo 23 MBTS',
    },
    {
      id: '2',
      name: 'Brizo 114 MBTS',
    },
    {
      id: '2',
      name: 'Brizo 16 BioAC',
    },
  ],
  onSelectNewDeployment() {
    console.log('new deployment')
  },
  onSelectDeployment(deployment) {
    console.log(deployment)
  },
  onEditDeployment: () => {
    console.log('event fired')
  },
  onRoleReassign: () => {
    console.log('event fired')
  },
  onIcon1hover: () => (
    <VehicleCommsCell
      icon={<ConnectedIcon />}
      headline="Cell Comms: Connected"
      host="lrauv-brizo-cell.shore.mbari.org"
      lastPing="Today at 14:40:36 (3s ago)"
      nextComms="14:55 (in 15m)"
      onSelect={() => {
        console.log('event fired')
      }}
    />
  ),
  onIcon2hover: () => (
    <VehicleInfoCell
      icon={<UnderwaterIcon />}
      headline="Likely underwater"
      subtitle="Last confirmed on surface 47min ago"
      lastCommsOverSat="Today at 14:08:36 (47m ago)"
      estimate="Est. to surface in 15 mins at ~14:55"
      onSelect={() => {
        console.log('event fired')
      }}
    />
  ),
  supportIcon1: <></>,
  supportIcon2: <></>,
}

test('should render deployment name to the screen', async () => {
  render(<OverviewToolbar {...props} />)

  expect(
    screen.getByText(props.deployment?.name ?? 'NO DEPLOYMENT SPECIFIED!')
  ).toBeInTheDocument()
})

test('should render deployment list toggle to the screen', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId('deploymentToggle')).toBeInTheDocument()
  expect(screen.queryByTestId('deploymentHeadline')).not.toBeInTheDocument()
})

test('should render the deployment dropdown when selecting the toggle', async () => {
  render(<OverviewToolbar {...props} />)

  fireEvent.click(screen.getByTestId('deploymentToggle'))
  expect(screen.getByText(/3 days ago/i)).toBeInTheDocument()
  expect(screen.getByText(/new brizo/i)).not.toHaveClass('opacity-30')
})

test('should disable the new deployment dropdown if no handler is present', async () => {
  render(<OverviewToolbar {...props} onSelectNewDeployment={undefined} />)

  fireEvent.click(screen.getByTestId('deploymentToggle'))
  expect(screen.getByText(/3 days ago/i)).toBeInTheDocument()
  expect(screen.getByText(/new brizo/i)).toHaveClass('opacity-30')
})

test('should render the icon1 hover popup', async () => {
  render(<OverviewToolbar {...props} onSelectNewDeployment={undefined} />)

  fireEvent.mouseOver(screen.getByTestId('icon1'))
  expect(screen.getByTestId(/icon1detail/i)).toBeInTheDocument()
  fireEvent.mouseOut(screen.getByTestId('icon1'))
  expect(screen.queryByText(/icon1detail/i)).not.toBeInTheDocument()
})

test('should render the icon2 hover popup', async () => {
  render(<OverviewToolbar {...props} onSelectNewDeployment={undefined} />)

  fireEvent.mouseOver(screen.getByTestId('icon2'))
  expect(screen.getByTestId(/icon2detail/i)).toBeInTheDocument()
  fireEvent.mouseOut(screen.getByTestId('icon2'))
  expect(screen.queryByText(/icon2detail/i)).not.toBeInTheDocument()
})

test('should not render deployment list toggle to the screen if there are no deployments or handlers', async () => {
  render(
    <OverviewToolbar
      {...props}
      onSelectDeployment={undefined}
      onSelectNewDeployment={undefined}
    />
  )

  expect(screen.getByTestId('deploymentHeadline')).toBeInTheDocument()
  expect(screen.queryByTestId('deploymentToggle')).not.toBeInTheDocument()
})

test('should render the role reassign button with pic and oncall', async () => {
  render(
    <OverviewToolbar
      {...props}
      pics={['First Pilot']}
      onCalls={['Second Pilot']}
      currentUserName="Current User"
    />
  )

  expect(screen.getByText(/First P./i)).toBeInTheDocument()
  expect(screen.getByText(/Second P./i)).toBeInTheDocument()
})

test('should not render the role reassign button if no click handler is provided', async () => {
  render(
    <OverviewToolbar
      {...props}
      onRoleReassign={undefined}
      pics={['First Pilot']}
      onCalls={['Second Pilot']}
    />
  )

  expect(screen.queryByText(/First P./i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Second P./i)).not.toBeInTheDocument()
})

test('should render the mission button if the handler is present', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId(/deploymentDetails/i)).toBeInTheDocument()
})

test('should not render the mission button if no handler is present', async () => {
  render(<OverviewToolbar {...props} onEditDeployment={undefined} />)

  expect(screen.queryByTestId(/deploymentDetails/i)).not.toBeInTheDocument()
})

test('should render the deployment toggle if the handler is present', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId(/deploymenttoggle/i)).toBeInTheDocument()
})

test('should not render the deployment toggle if no handler is present', async () => {
  render(
    <OverviewToolbar
      {...props}
      onSelectDeployment={undefined}
      onSelectNewDeployment={undefined}
    />
  )

  expect(screen.queryByTestId(/deploymenttoggle/i)).not.toBeInTheDocument()
})

test('should render the first support icon if the handler is present', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId(/icon1/i)).toBeInTheDocument()
})

test('should not render the first support icon if no handler is present', async () => {
  render(<OverviewToolbar {...props} onIcon1hover={undefined} />)

  expect(screen.queryByTestId(/icon1/i)).not.toBeInTheDocument()
})

test('should not render the first support icon if no icon is present', async () => {
  render(<OverviewToolbar {...props} supportIcon1={undefined} />)

  expect(screen.queryByTestId(/icon1/i)).not.toBeInTheDocument()
})

test('should render the second support icon if the handler is present', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId(/icon2/i)).toBeInTheDocument()
})

test('should not render the second support icon if no handler is present', async () => {
  render(<OverviewToolbar {...props} onIcon2hover={undefined} />)

  expect(screen.queryByTestId(/icon2/i)).not.toBeInTheDocument()
})

test('should not render the second support icon if no icon is present', async () => {
  render(<OverviewToolbar {...props} supportIcon2={undefined} />)

  expect(screen.queryByTestId(/icon2/i)).not.toBeInTheDocument()
})
