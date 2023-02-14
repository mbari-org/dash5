import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  BatteryMonitorPopup,
  BatteryMonitorPopupProps,
} from './BatteryMonitorPopup'

jest.mock('../assets/stand-in-chart.png', () => {
  return {
    default: 'fake.png',
  }
})

const props: BatteryMonitorPopupProps = {
  open: true,
  batteryPercent: 72,
  batteryRemaining: {
    hours: 1,
    distance: { value: 20, unit: 'mi' },
  },
  missionRemaining: {
    hours: 2,
    distance: { value: 40, unit: 'mi' },
  },
  suggestions: [
    {
      headline: 'Reduce thruster speeds to 25% power',
      important: true,
      improvement: '1hr',
      description: 'this is a test description',
      onExternalInfoClick: () => {
        console.log(
          `there's something happening here. what it is ain't exactly clear`
        )
      },
    },
    {
      headline: 'Turn off DVL',
      improvement: '30min',
      description: 'Moderate energy savings',
    },
  ],
  onClose: () => {
    console.log('close')
  },
}

test('should render the component', async () => {
  expect(() => render(<BatteryMonitorPopup {...props} />)).not.toThrow()
})

test('should display battery percentage', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(screen.queryByText(/Battery monitor: 72%/i)).toBeInTheDocument()
})

test('should display battery remaining', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(screen.queryByText(/1 hour/i)).toBeInTheDocument()
  expect(screen.queryByText(/(~20mi)/i)).toBeInTheDocument()
})

test('should display mission remaining', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(screen.queryByText(/2 hours/i)).toBeInTheDocument()
  expect(screen.queryByText(/(~40mi)/i)).toBeInTheDocument()
})

test('should display suggestion headline', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(
    screen.queryByText(/Reduce thruster speeds to 25% power/i)
  ).toBeInTheDocument()
})

test('should display suggestion headline in medium bold font if important', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(
    screen.queryByText(/Reduce thruster speeds to 25% power/i)
  ).toHaveClass('font-medium')
  expect(screen.queryByText(/Turn off DVL/i)).not.toHaveClass('font-medium')
})

test('should display external link icon if onExternalInfoClick prop is present', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(screen.queryByLabelText(/external info button/i)).toBeInTheDocument()
})

test('should display battery life improvement', async () => {
  render(<BatteryMonitorPopup {...props} />)

  expect(screen.queryByText(/\+1hr/i)).toBeInTheDocument()
})

test('should description after more info button is clicked', async () => {
  render(<BatteryMonitorPopup {...props} />)

  const moreInfo = screen.queryAllByLabelText(/more info button/i)[0]

  expect(
    screen.queryByText(/this is a test description/i)
  ).not.toBeInTheDocument()

  fireEvent.click(moreInfo)
  expect(screen.queryByText(/this is a test description/i)).toBeInTheDocument()
})

test('should display no current suggestions headline if no suggestions are available', async () => {
  render(<BatteryMonitorPopup {...props} suggestions={[]} />)

  expect(screen.queryByText(/No current suggestions/i)).toBeInTheDocument()
})
