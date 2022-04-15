import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StepProgress, StepProgressProps } from './StepProgress'

const props: StepProgressProps = {
  steps: ['Mission', 'Waypoints'],
  currentIndex: 0,
}

test('should render step title', async () => {
  render(<StepProgress {...props} />)
  expect(screen.getByText(props.steps[0])).toBeInTheDocument()
})

test('should display step with a blue background and white text when in progress', async () => {
  render(<StepProgress {...props} currentIndex={0} />)

  const step = screen.getByText(props.steps[0]).closest('li')

  expect(step).toHaveClass('bg-primary-600')
  expect(step).toHaveClass('text-white')
})

test('should display step with a light gray background and dark gray text when in progress', async () => {
  render(<StepProgress {...props} currentIndex={0} />)

  const step = screen.getByText(props.steps[1]).closest('li')

  expect(step).toHaveClass('bg-stone-200')
  expect(step).toHaveClass('text-stone-500')
})
