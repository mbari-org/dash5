import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PluggedInIcon, PluggedInIconProps } from './PluggedInIcon'

const props: PluggedInIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<PluggedInIcon {...props} />)).not.toThrow()
})
