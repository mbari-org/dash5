import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OverviewToolbar, OverviewToolbarProps } from './OverviewToolbar'
import { faEye } from '@fortawesome/pro-light-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const props: OverviewToolbarProps = {
  deployment: 'Brizo 7 EcoHab',
  pilotInCharge: 'Tanner P. (you)',
  pilotOnCall: 'Brian K.',
  btnIcon: faEye as IconDefinition,
  open: false,
  onClickDeployment: () => {
    console.log('event fired')
  },
  onClickMissions: () => {
    console.log('event fired')
  },
  onClickPilot: () => {
    console.log('event fired')
  },
  onIcon1hover: () => <></>,
  onIcon2hover: () => <></>,
  supportIcon1: <></>,
  supportIcon2: <></>,
}

test('should render mission name to the screen', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByText(props.deployment)).toBeInTheDocument()
})

test('should render button labels', async () => {
  render(
    <OverviewToolbar
      {...props}
      pilotInCharge={'first pilot'}
      pilotOnCall={'second pilot'}
    />
  )

  expect(screen.getByText(/first pilot/i)).toBeInTheDocument()
  expect(screen.getByText(/second pilot/i)).toBeInTheDocument()
})

test('should render the mission button if the handler is present', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId(/missions/i)).toBeInTheDocument()
})

test('should not render the mission button if no handler is present', async () => {
  render(<OverviewToolbar {...props} onClickMissions={undefined} />)

  expect(screen.queryByTestId(/missions/i)).not.toBeInTheDocument()
})

test('should render the deployment toggle if the handler is present', async () => {
  render(<OverviewToolbar {...props} />)

  expect(screen.getByTestId(/deploymenttoggle/i)).toBeInTheDocument()
})

test('should not render the deployment toggle if no handler is present', async () => {
  render(<OverviewToolbar {...props} onClickDeployment={undefined} />)

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
