import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StepProgress, StepProgressProps } from './StepProgress'

const props: StepProgressProps = {
  steps: [
    { id: '1', title: 'Mission', inProgress: true },
    { id: '2', title: 'Waypoints', inProgress: false },
  ],
}

test('should render step title', async () => {
  render(<StepProgress {...props} />)
  expect(screen.getByText(props.steps[0].title)).toBeInTheDocument()
})

test('should display step with a blue background and white text when in progress', async () => {
  props.steps[0].inProgress = true
  render(<StepProgress {...props} />)

  const step = screen.getByText(props.steps[0].title).closest('li')

  expect(step).toHaveClass('bg-primary-600')
  expect(step).toHaveClass('text-white')
})

test('should display step with a light gray background and dark gray text when in progress', async () => {
  props.steps[1].inProgress = false
  render(<StepProgress {...props} />)

  const step = screen.getByText(props.steps[1].title).closest('li')

  expect(step).toHaveClass('bg-stone-200')
  expect(step).toHaveClass('text-stone-500')
})
