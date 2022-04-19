import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VehicleInfoCell, VehicleInfoCellProps } from './VehicleInfoCell'

const props: VehicleInfoCellProps = {
  icon: {} as any,
  headline: 'example',
  subtitle: 'example',
  lastCommsOverSat: 'example',
  estimate: 'example',
}

test.todo('should have tests')

// test('should render the component', async () => {
//   expect(() => render(<VehicleInfoCell {...props} />)).not.toThrow()
// })
