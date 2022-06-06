import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Vehicle, VehicleProps } from './Vehicle'

const props: VehicleProps = {
  textVehicle: 'BRIZO',
  status: 'onMission',
  textMission: 'test mission',
  textLastUpdate: '11:50',
}

test('should render the component', async () => {
  expect(() => render(<Vehicle {...props} />)).not.toThrow()
})

test('should display arrive station text when it is provided', async () => {
  render(<Vehicle {...props} textArriveStation="test arrive station text" />)
  expect(screen.queryByText(/test arrive station text/i)).toBeInTheDocument()
})

test('should display station arrival distance when it is provided', async () => {
  render(<Vehicle {...props} textStationDist="222km" />)
  expect(screen.queryByText(/222km/i)).toBeInTheDocument()
})

test('should display current distance text when it is provided', async () => {
  render(<Vehicle {...props} textCurrentDist="555km" />)
  expect(screen.queryByText(/555km/i)).toBeInTheDocument()
})

test('should make the arrive station label invisible when not on a mission', async () => {
  render(<Vehicle {...props} status={'pluggedIn'} />)
  // st18 class is no stroke and no fill
  expect(screen.queryByTestId(/arrive_label/i)).toHaveClass('st18')
})

test('should display background wave when wavecolor is provided', async () => {
  render(<Vehicle {...props} colorWavecolor={'st0'} />)
  // st0 class is wave blue fill
  expect(screen.queryByTestId(/background wave/i)).toHaveClass('st0')
})

test('should display sandy ground background when dirt box color is provided', async () => {
  render(<Vehicle {...props} colorDirtbox={'st17'} />)
  // st17 class is dirtbox brown fill
  expect(screen.queryByTestId(/dirtbox/i)).toHaveClass('st17')
})

test('should display battery 1 color as teal when provided', async () => {
  render(<Vehicle {...props} colorBat1={'st4'} />)
  // st4 class is black stroke and teal fill
  expect(screen.queryByLabelText(/bat1/i)).toHaveClass('st4')
})

test('should display battery 2 color as dark gray when provided', async () => {
  render(<Vehicle {...props} colorBat2={'st11'} />)
  // st11 class is black stroke and dark gray fill
  expect(screen.queryByLabelText(/bat2/i)).toHaveClass('st11')
})

test('should display amp color as provided color', async () => {
  render(<Vehicle {...props} colorAmps={'st4'} />)
  expect(screen.queryByLabelText('amps')).toHaveClass('st4')
})

test('should display volt color as provided color', async () => {
  render(<Vehicle {...props} colorVolts={'st6'} />)
  expect(screen.queryByLabelText('volts')).toHaveClass('st6')
})

test('should display volts when provided', async () => {
  render(<Vehicle {...props} textVolts="15.7" />)
  expect(screen.queryByText(/15.7/i)).toBeInTheDocument()
})

test('should display amps when provided', async () => {
  render(<Vehicle {...props} textAmps="18.8" />)
  expect(screen.queryByText(/18.8/i)).toBeInTheDocument()
})

test('should display amps ago text when provided', async () => {
  render(<Vehicle {...props} textAmpAgo="77m ago" />)
  expect(screen.queryByText(/77m ago/i)).toBeInTheDocument()
})

test('should display the cart and associated circles as provided colors', async () => {
  render(<Vehicle {...props} colorCart={'st6'} colorCartCircle={'st3'} />)
  expect(screen.queryByLabelText(/cart/i)).toHaveClass('st6')
  expect(screen.queryByTestId(/circle1/i)).toHaveClass('st3')
  expect(screen.queryByTestId(/circle2/i)).toHaveClass('st3')
})

test('should display the charging cable as provided colors', async () => {
  render(<Vehicle {...props} colorSmallCable={'st5'} colorBigCable={'st6'} />)
  expect(screen.queryByLabelText(/smallcable/i)).toHaveClass('st5')
  expect(screen.queryByLabelText(/bigcable/i)).toHaveClass('st6')
})

test('should display the sat comms color as provided color', async () => {
  render(<Vehicle {...props} colorSatComm={'st4'} />)
  expect(screen.queryByTestId(/satcomm/i)).toHaveClass('st4')
})

test('should display the cell comms color as provided color', async () => {
  render(<Vehicle {...props} colorCell={'st6'} />)
  expect(screen.queryByTestId(/cell/i)).toHaveClass('st6')
})

test('should display sat comms text when provided', async () => {
  render(<Vehicle {...props} textSat="10:28" />)
  expect(screen.queryByText(/10:28/i)).toBeInTheDocument()
})

test('should display cell comms text when provided', async () => {
  render(<Vehicle {...props} textCell="12:48" />)
  expect(screen.queryByText(/12:48/i)).toBeInTheDocument()
})

test('should display time since last sat comms text when provided', async () => {
  render(<Vehicle {...props} textCommAgo="99m ago" />)
  expect(screen.queryByText(/99m ago/i)).toBeInTheDocument()
})

test('should display time since last cell comms text when provided', async () => {
  render(<Vehicle {...props} textCellAgo="66m ago" />)
  expect(screen.queryByText(/66m ago/i)).toBeInTheDocument()
})

test('should display drop weight indicator color as provided color', async () => {
  render(<Vehicle {...props} colorDrop={'st6'} />)
  expect(screen.queryByLabelText(/drop weight indicator/i)).toHaveClass('st6')
})

test('should display time since last drop weight text when provided', async () => {
  render(<Vehicle {...props} textDroptime="55m ago" />)
  expect(screen.queryByText(/55m ago/i)).toBeInTheDocument()
})

test('should display dvl indicator color as provided color', async () => {
  render(<Vehicle {...props} colorDvl={'st6'} />)
  expect(screen.queryByLabelText(/dvl indicator/i)).toHaveClass('st6')
})

test('should display DVL status text when provided', async () => {
  render(<Vehicle {...props} textDvlStatus="ON" />)
  expect(screen.queryByText('ON')).toBeInTheDocument()
})

test('should display critical error text when provided', async () => {
  render(<Vehicle {...props} textCriticalError="test error text" />)
  expect(screen.queryByText('test error text')).toBeInTheDocument()
})

test('should display critical error time when provided', async () => {
  render(<Vehicle {...props} textCriticalTime="test error time" />)
  expect(screen.queryByText('test error time')).toBeInTheDocument()
})

test('should display gps text box background color as provided color', async () => {
  render(<Vehicle {...props} colorGps={'st6'} />)
  expect(screen.queryByTestId(/gps color/i)).toHaveClass('st6')
})

test('should display GPS text when provided', async () => {
  render(<Vehicle {...props} textGps="12:02" />)
  expect(screen.queryByText(/12:02/i)).toBeInTheDocument()
})

test('should display time since last GPS text when provided', async () => {
  render(<Vehicle {...props} textGpsAgo="11m ago" />)
  expect(screen.queryByText(/11m ago/i)).toBeInTheDocument()
})

test('should display ground fault text box background color as provided color', async () => {
  render(<Vehicle {...props} colorGf={'st6'} />)
  expect(screen.queryByTestId(/ground fault color/i)).toHaveClass('st6')
})

test('should display ground fault text when provided', async () => {
  render(<Vehicle {...props} textGf="-0.14" />)
  expect(screen.queryByText(/-0.14/i)).toBeInTheDocument()
})

test('should display time since last ground fault text when provided', async () => {
  render(<Vehicle {...props} textGfTime="11m ago" />)
  expect(screen.queryByText(/11m ago/i)).toBeInTheDocument()
})

test('should display arrow color as provided color', async () => {
  render(<Vehicle {...props} colorArrow={'st6'} />)
  expect(screen.queryByTestId(/arrow head/i)).toHaveClass('st6')
})

test('should display bearing text in degrees when provided', async () => {
  render(<Vehicle {...props} textArrow="15" />)
  expect(screen.queryByText(/15°/i)).toBeInTheDocument()
})

test('should display thrust time when provided', async () => {
  render(<Vehicle {...props} textThrustTime="2.8km/hr" />)
  expect(screen.queryByText('2.8km/hr')).toBeInTheDocument()
})

test('should display reckoned distance when provided', async () => {
  render(<Vehicle {...props} textReckonDistance="3.3km in 1.0h" />)
  expect(screen.queryByText('3.3km in 1.0h')).toBeInTheDocument()
})

test('should display log time text when provided', async () => {
  render(<Vehicle {...props} textLogTime="13:31" />)
  expect(screen.queryByText(/13:31/i)).toBeInTheDocument()
})

test('should display time since last Log text when provided', async () => {
  render(<Vehicle {...props} textLogAgo="22m ago" />)
  expect(screen.queryByText(/22m ago/i)).toBeInTheDocument()
})

test('should display mission status indicator color as provided color', async () => {
  render(<Vehicle {...props} colorMissionDefault={'st5'} />)
  expect(screen.queryByTestId(/mission status indicator/i)).toHaveClass('st5')
})

test('should display mission text when provided', async () => {
  render(<Vehicle {...props} textMission="test mission" />)
  expect(screen.queryByText(/test mission/i)).toBeInTheDocument()
})

test('should display next comm indicator color as provided color', async () => {
  render(
    <Vehicle {...props} colorNextComm={'st5'} textNextComm="test next comm" />
  )
  expect(screen.queryByTestId('next comm indicator')).toHaveClass('st5')
})

test('should display next comm text when provided', async () => {
  render(<Vehicle {...props} textNextComm="test next comm" />)
  expect(screen.queryByText(/test next comm/i)).toBeInTheDocument()
})

test('should display note text when provided', async () => {
  render(<Vehicle {...props} textNote="test note text" />)
  expect(screen.queryByText('test note text')).toBeInTheDocument()
})

test('should display note time when provided', async () => {
  render(<Vehicle {...props} textNoteTime="test note time" />)
  expect(screen.queryByText('test note time')).toBeInTheDocument()
})

test('should display scheduled indicator color as provided color', async () => {
  render(
    <Vehicle {...props} colorScheduled={'st5'} textScheduled="test scheduled" />
  )
  expect(screen.queryByTestId('scheduled indicator')).toHaveClass('st5')
})

test('should display scheduled text when provided', async () => {
  render(<Vehicle {...props} textScheduled="test scheduled" />)
  expect(screen.queryByText(/test scheduled/i)).toBeInTheDocument()
})

test('should display thruster speed text when provided', async () => {
  render(<Vehicle {...props} textSpeed="1.10m/s" />)
  expect(screen.queryByText(/1.10m\/s/i)).toBeInTheDocument()
})

test('should display thruster indicator color as provided color', async () => {
  render(<Vehicle {...props} colorThrust={'st5'} />)
  expect(screen.queryByTestId('thruster indicator')).toHaveClass('st5')
})

test('should display HW indicator color as provided color', async () => {
  render(<Vehicle {...props} colorHw={'st5'} />)
  expect(screen.queryByLabelText('HW')).toHaveClass('st5')
})

test('should display SW indicator color as provided color', async () => {
  render(<Vehicle {...props} colorSw={'st5'} />)
  expect(screen.queryByLabelText('SW')).toHaveClass('st5')
})

test('should display timeout text when provided', async () => {
  render(<Vehicle {...props} textTimeout="17:47" />)
  expect(screen.queryByText(/17:47/i)).toBeInTheDocument()
})

test('should display vehicle name', async () => {
  render(<Vehicle {...props} />)
  expect(screen.queryByText(props.textVehicle)).toBeInTheDocument()
})

test("should display the vehicle's last update ", async () => {
  render(<Vehicle {...props} />)
  expect(screen.queryByText(`${props.textLastUpdate}`)).toBeInTheDocument()
})
