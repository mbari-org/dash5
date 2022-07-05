import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  DeploymentDetailsPopUp,
  DeploymentDetailsPopUpProps,
} from './DeploymentDetailsPopUp'

const props: DeploymentDetailsPopUpProps = {
  name: 'example',
  complete: true,
  queueSize: 1,
  startDate: 'example',
  launchDate: 'example',
  recoveryDate: 'example',
  endDate: 'example',
  onSaveChanges: () => {
    console.log('save')
  },
  onSetDeploymentEventToCurrentTime: () => {
    console.log('set')
  },
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<DeploymentDetailsPopUp {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<DeploymentDetailsPopUp>Click Here</DeploymentDetailsPopUp>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
