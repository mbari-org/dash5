import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ScheduleSection, ScheduleSectionProps } from './ScheduleSection'

const props: ScheduleSectionProps = {
  authenticated: true,
  vehicleName: 'example',
  currentDeploymentId: 1,
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<ScheduleSection {...props} />)).not.toThrow()
})

// test('should render child content', async () => {
//   render(<ScheduleSection>Click Here</ScheduleSection>)
//   expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
// })
