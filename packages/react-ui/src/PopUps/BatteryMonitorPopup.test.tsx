import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  BatteryMonitorPopup,
  BatteryMonitorPopupProps,
} from './BatteryMonitorPopup'

const props: BatteryMonitorPopupProps = {
  batteryPercent: 1,
  batteryRemaining: {} as any,
  missionRemaining: {} as any,
  suggestions: [],
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<BatteryMonitorPopup {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<BatteryMonitorPopup>Click Here</BatteryMonitorPopup>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
