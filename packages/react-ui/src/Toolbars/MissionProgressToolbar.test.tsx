import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  MissionProgressToolbar,
  MissionProgressToolbarProps,
} from './MissionProgressToolbar'
import { DateTime } from 'luxon'

const props: MissionProgressToolbarProps = {
  ticks: 5,
  startTime: DateTime.local().minus({ days: 3, hours: 7 }).toISO(),
  endTime: DateTime.local().plus({ days: 1, hours: 3 }).toISO(),
  ariaLabel: 'Mission Progress Toolbar Test',
}

test('should render the component', async () => {
  render(<MissionProgressToolbar {...props} />)
  expect(screen.queryByLabelText(props.ariaLabel)).toBeInTheDocument()
})

test('should render 5 tick marks', async () => {
  render(<MissionProgressToolbar {...props} />)
  await waitFor(() => screen.getByLabelText(`${props.ariaLabel}-tick-1-3d`))
  expect(
    screen.queryByLabelText(`${props.ariaLabel}-tick-1-3d`)
  ).toBeInTheDocument()
  expect(
    screen.queryByLabelText(`${props.ariaLabel}-tick-2-2d`)
  ).toBeInTheDocument()
  expect(
    screen.queryByLabelText(`${props.ariaLabel}-tick-3-1d`)
  ).toBeInTheDocument()
  expect(
    screen.queryByLabelText(`${props.ariaLabel}-tick-4-8h`)
  ).toBeInTheDocument()
  expect(
    screen.queryByLabelText(`${props.ariaLabel}-tick-5-9h`)
  ).toBeInTheDocument()
})

test('should render the launch and projected points', async () => {
  render(<MissionProgressToolbar {...props} />)
  expect(screen.queryByLabelText(/projected/i)).toBeInTheDocument()
  expect(screen.queryByLabelText(/launch/i)).toBeInTheDocument()
})
