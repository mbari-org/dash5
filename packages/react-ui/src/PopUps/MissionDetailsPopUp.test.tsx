import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  MissionDetailsPopUp,
  MissionDetailsPopUpProps,
} from './MissionDetailsPopUp'

const props: MissionDetailsPopUpProps = {
  // overrides: [],
  // estimates: [],
  estimatedStart: 'example',
  estimatedEnd: 'example',
  // missionId: 1,
  missionStatus: 'waiting',
  missionName: 'example',
  commandName: 'example',
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<MissionDetailsPopUp {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<MissionDetailsPopUp>Click Here</MissionDetailsPopUp>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
