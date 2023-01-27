import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StepProgress, StepProgressProps } from './StepProgress'

const props: StepProgressProps = {
  steps: ['Mission', 'Waypoints'],
  currentStepIndex: 0,
}

test('should render step title', async () => {
  render(<StepProgress {...props} />)

  expect(screen.queryAllByText(/mission/i)[0]).toHaveTextContent('1. Mission')
  expect(screen.queryAllByText(/waypoints/i)[0]).toHaveTextContent(
    '2. Waypoints'
  )
})

test('should display step with white text when in progress', async () => {
  render(<StepProgress {...props} />)

  const step = screen.queryAllByText(/mission/i)[1]

  expect(step).toHaveClass('text-white')
})

test('should display step with gray text when in progress', async () => {
  render(<StepProgress {...props} />)

  const step = screen.queryAllByText(/waypoints/i)[1]

  expect(step).toHaveClass('text-stone-500/90')
})

test('should display step with a light gray background and dark gray text when in progress', async () => {
  render(<StepProgress {...props} />)

  const svg = screen.getAllByTestId('step-progress-svg')[0]

  expect(svg).toHaveClass('fill-primary-600')
})

test('should display step with a light gray background and dark gray text when in progress', async () => {
  render(<StepProgress {...props} />)

  const svg = screen.getAllByTestId('step-progress-svg')[1]

  expect(svg).toHaveClass('fill-stone-200')
})
