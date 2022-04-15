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
  onClickDeployment: () => {},
  onClickMissions: () => {},
  onClickPilot: () => {},
  onIcon1hover: () => <></>,
  onIcon2hover: () => <></>,
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
