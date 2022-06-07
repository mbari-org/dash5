import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleCell, VehicleCellProps } from './VehicleCell'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/pro-light-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { VehicleProps } from '../Diagrams'

const syncIcon = (
  <FontAwesomeIcon icon={faSync as IconProp} className="text-xl" />
)

const props: VehicleCellProps = {
  icon: syncIcon,
  headline: (
    <div>
      <span className="font-semibold text-purple-600">Plugged in</span> for 17
      days 8 hours
    </div>
  ),
  lastPosition: 'position test',
  lastSatellite: 'satellite test',
  lastCell: 'cell test',
  lastKnownGPS: 'gps test',
  lastCommunication: 'communication test',
}

const diagramProps: VehicleProps = {
  textVehicle: 'DAPHNE',
  status: 'pluggedIn',
  textMission: 'PLUGGED IN 08:14 • 29Nov21',
  colorDirtbox: 'st17',
  colorSmallCable: 'st23',
  colorBigCable: 'st22',
  colorCart: 'st19',
  colorCartCircle: 'st17',
  textLastUpdate: '10:54',
  colorArrow: 'st16',
}

test('should render the component', async () => {
  expect(() => render(<VehicleCell {...props} />)).not.toThrow()
})

test('should render the headline', async () => {
  render(<VehicleCell {...props} />)

  expect(screen.getByText(/plugged in/i)).toBeInTheDocument()
})

test('should render last position info when supplied', async () => {
  render(<VehicleCell {...props} />)

  expect(screen.getByText(/position test/i)).toBeInTheDocument()
})
test('should render last satellite info when supplied', async () => {
  render(<VehicleCell {...props} />)

  expect(screen.getByText(/satellite test/i)).toBeInTheDocument()
})

test('should render last cell info when supplied', async () => {
  render(<VehicleCell {...props} />)

  expect(screen.getByText(/cell test/i)).toBeInTheDocument()
})

test('should render last gps info when supplied', async () => {
  render(<VehicleCell {...props} />)

  expect(screen.getByText(/gps test/i)).toBeInTheDocument()
})

test('should render last communication info when supplied', async () => {
  render(<VehicleCell {...props} />)

  expect(screen.getByText(/communication test/i)).toBeInTheDocument()
})

test('should display vehicle diagram when supplied', async () => {
  render(<VehicleCell {...props} vehicle={diagramProps} />)

  expect(screen.queryByLabelText(/vehicle diagram/i)).toBeInTheDocument()
})
