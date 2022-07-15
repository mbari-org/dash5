import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleProps } from './Vehicle'
import { FullWidthVehicleDiagram } from './FullWidthVehicleDiagram'

const props: VehicleProps = {
  textVehicle: 'BRIZO',
  status: 'onMission',
  textMission: 'test mission',
  textLastUpdate: '11:50',
}

test('should render the component', async () => {
  expect(() => render(<FullWidthVehicleDiagram {...props} />)).not.toThrow()
})

test('should display arrive station text when it is provided', async () => {
  render(
    <FullWidthVehicleDiagram
      {...props}
      textArriveStation="test arrive station text"
    />
  )
  expect(screen.queryByText(/test arrive station text/i)).toBeInTheDocument()
})

test('should display station arrival distance when it is provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textStationDist="222km" />)
  expect(screen.queryByText(/222km/i)).toBeInTheDocument()
})

test('should display current distance text when it is provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textCurrentDist="555km" />)
  expect(screen.queryByText(/555km/i)).toBeInTheDocument()
})

test('should make the arrive station label invisible when not on a mission', async () => {
  render(<FullWidthVehicleDiagram {...props} status={'pluggedIn'} />)
  // st18 class is no stroke and no fill
  expect(screen.queryByTestId(/arrive_label/i)).toHaveClass('st18')
})

test('should display background wave when wavecolor is provided', async () => {
  render(<FullWidthVehicleDiagram {...props} colorWavecolor={'st0'} />)
  // st0 class is wave blue fill
  expect(screen.queryByTestId(/background wave/i)).toHaveClass('st0')
})

test('should display sandy ground background when dirt box color is provided', async () => {
  render(
    <FullWidthVehicleDiagram
      {...props}
      status="pluggedIn"
      colorDirtbox="st17"
    />
  )
  // st17 class is dirtbox brown fill
  expect(screen.queryByTestId(/dirtbox/i)).toHaveClass('st17')
})

test('should display battery 1 color as teal when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} colorBat1={'st4'} />)
  // st4 class is black stroke and teal fill
  expect(screen.queryByLabelText(/bat1/i)).toHaveClass('st4')
})

test('should display battery 2 color as dark gray when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} colorBat2={'st11'} />)
  // st11 class is black stroke and dark gray fill
  expect(screen.queryByLabelText(/bat2/i)).toHaveClass('st11')
})

test('should display amp color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorAmps={'st4'} />)
  expect(screen.queryByLabelText('amps')).toHaveClass('st4')
})

test('should display volt color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorVolts={'st6'} />)
  expect(screen.queryByLabelText('volts')).toHaveClass('st6')
})

test('should display volts when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textVolts="15.7" />)
  expect(screen.queryByText(/15.7/i)).toBeInTheDocument()
})

test('should display amps when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textAmps="18.8" />)
  expect(screen.queryByText(/18.8/i)).toBeInTheDocument()
})

test('should display amps ago text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textAmpAgo="77m ago" />)
  expect(screen.queryByText(/77m ago/i)).toBeInTheDocument()
})

test('should display the cart and associated circles as provided colors', async () => {
  render(
    <FullWidthVehicleDiagram
      {...props}
      colorCart={'st6'}
      colorCartCircle={'st3'}
    />
  )
  expect(screen.queryByLabelText(/cart/i)).toHaveClass('st6')
  expect(screen.queryByTestId(/circle1/i)).toHaveClass('st3')
  expect(screen.queryByTestId(/circle2/i)).toHaveClass('st3')
})

test('should display the charging cable as provided colors', async () => {
  render(
    <FullWidthVehicleDiagram
      {...props}
      colorSmallCable={'st5'}
      colorBigCable={'st6'}
    />
  )
  expect(screen.queryByLabelText(/smallcable/i)).toHaveClass('st5')
  expect(screen.queryByLabelText(/bigcable/i)).toHaveClass('st6')
})

test('should display the sat comms color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorSatComm={'st4'} />)
  expect(screen.queryByTestId(/satcomm/i)).toHaveClass('st4')
})

test('should display the cell comms color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorCell={'st6'} />)
  expect(screen.queryByTestId(/cell/i)).toHaveClass('st6')
})

test('should display sat comms text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textSat="10:28" />)
  expect(screen.queryByText(/10:28/i)).toBeInTheDocument()
})

test('should display cell comms text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textCell="12:48" />)
  expect(screen.queryByText(/12:48/i)).toBeInTheDocument()
})

test('should display time since last sat comms text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textCommAgo="99m ago" />)
  expect(screen.queryByText(/99m ago/i)).toBeInTheDocument()
})

test('should display time since last cell comms text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textCellAgo="66m ago" />)
  expect(screen.queryByText(/66m ago/i)).toBeInTheDocument()
})

test('should display drop weight indicator color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorDrop={'st6'} />)
  expect(screen.queryByLabelText(/drop weight indicator/i)).toHaveClass('st6')
})

test('should display time since last drop weight text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textDroptime="55m ago" />)
  expect(screen.queryByText(/55m ago/i)).toBeInTheDocument()
})

test('should display dvl indicator color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorDvl={'st6'} />)
  expect(screen.queryByLabelText(/dvl indicator/i)).toHaveClass('st6')
})

test('should display DVL status text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textDvlStatus="ON" />)
  expect(screen.queryByText('ON')).toBeInTheDocument()
})

test('should display critical error text when provided', async () => {
  render(
    <FullWidthVehicleDiagram {...props} textCriticalError="test error text" />
  )
  expect(screen.queryByText('test error text')).toBeInTheDocument()
})

test('should display critical error time when provided', async () => {
  render(
    <FullWidthVehicleDiagram {...props} textCriticalTime="test error time" />
  )
  expect(screen.queryByText('test error time')).toBeInTheDocument()
})

test('should display gps text box background color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorGps={'st6'} />)
  expect(screen.queryByTestId(/gps color/i)).toHaveClass('st6')
})

test('should display GPS text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textGps="12:02" />)
  expect(screen.queryByText(/12:02/i)).toBeInTheDocument()
})

test('should display time since last GPS text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textGpsAgo="11m ago" />)
  expect(screen.queryByText(/11m ago/i)).toBeInTheDocument()
})

test('should display ground fault text box background color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorGf={'st6'} />)
  expect(screen.queryByTestId(/ground fault color/i)).toHaveClass('st6')
})

test('should display ground fault text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textGf="-0.14" />)
  expect(screen.queryByText(/-0.14/i)).toBeInTheDocument()
})

test('should display time since last ground fault text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textGfTime="11m ago" />)
  expect(screen.queryByText(/11m ago/i)).toBeInTheDocument()
})

test('should display bearing text in degrees when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textArrow="15" />)
  expect(screen.queryByText(/15°/i)).toBeInTheDocument()
})

test('should display thrust time when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textThrustTime="2.8km/hr" />)
  expect(screen.queryByText('2.8km/hr')).toBeInTheDocument()
})

test('should display reckoned distance when provided', async () => {
  render(
    <FullWidthVehicleDiagram {...props} textReckonDistance="3.3km in 1.0h" />
  )
  expect(screen.queryByText('3.3km in 1.0h')).toBeInTheDocument()
})

test('should display thruster speed text when provided', async () => {
  render(<FullWidthVehicleDiagram {...props} textSpeed="1.10m/s" />)
  expect(screen.queryByText(/1.10m\/s/i)).toBeInTheDocument()
})

test('should display thruster indicator color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorThrust={'st5'} />)
  expect(screen.queryByTestId('thruster indicator')).toHaveClass('st5')
})

test('should display HW indicator color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorHw={'st5'} />)
  expect(screen.queryByLabelText('HW')).toHaveClass('st5')
})

test('should display SW indicator color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorSw={'st5'} />)
  expect(screen.queryByLabelText('SW')).toHaveClass('st5')
})

test('should display OT indicator color as provided color', async () => {
  render(<FullWidthVehicleDiagram {...props} colorOt={'st5'} />)
  expect(screen.queryByLabelText('OT')).toHaveClass('st5')
})

test('should display vehicle name', async () => {
  render(<FullWidthVehicleDiagram {...props} />)
  expect(screen.queryByText(props.textVehicle)).toBeInTheDocument()
})

test("should display the vehicle's last update ", async () => {
  render(<FullWidthVehicleDiagram {...props} />)
  expect(screen.queryByText(`${props.textLastUpdate}`)).toBeInTheDocument()
})

test('should display heading label', async () => {
  render(<FullWidthVehicleDiagram {...props} />)
  expect(screen.queryByTestId('heading label')).toBeInTheDocument()
})

test('should display speed label', async () => {
  render(<FullWidthVehicleDiagram {...props} />)
  expect(screen.queryByTestId('speed label')).toBeInTheDocument()
})
