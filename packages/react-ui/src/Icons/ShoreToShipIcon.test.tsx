import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ShoreToShipIcon, ShoreToShipIconProps } from './ShoreToShipIcon'

const props: ShoreToShipIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<ShoreToShipIcon {...props} />)).not.toThrow()
})

test('should apply lower opacity to parts of icon when waiting', async () => {
  render(<ShoreToShipIcon {...props} waiting={true} />)

  expect(screen.queryByTestId(/checkmark/i)).toHaveAttribute(
    'stroke-opacity',
    '60%'
  )
})
