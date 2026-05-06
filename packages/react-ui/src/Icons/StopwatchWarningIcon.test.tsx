import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  StopwatchWarningIcon,
  StopwatchWarningIconProps,
} from './StopwatchWarningIcon'

const props: StopwatchWarningIconProps = {}

test('should render without throwing', () => {
  expect(() => render(<StopwatchWarningIcon {...props} />)).not.toThrow()
})

test('should have accessible label', () => {
  render(<StopwatchWarningIcon {...props} />)

  expect(screen.getByLabelText('timeout warning icon')).toBeInTheDocument()
})

test('should apply className to the wrapper span', () => {
  render(<StopwatchWarningIcon className="my-custom-class" />)

  expect(screen.getByLabelText('timeout warning icon')).toHaveClass(
    'my-custom-class'
  )
})

test('caller style is applied but position/display are still enforced', () => {
  render(
    <StopwatchWarningIcon style={{ fontSize: '3rem', position: 'static' }} />
  )

  const wrapper = screen.getByLabelText('timeout warning icon')
  // position must remain 'relative' regardless of caller style
  expect(wrapper).toHaveStyle({ position: 'relative' })
  expect(wrapper).toHaveStyle({ display: 'inline-block' })
})
