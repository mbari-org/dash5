import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SurfacedIcon, SurfacedIconProps } from './SurfacedIcon'

const props: SurfacedIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<SurfacedIcon {...props} />)).not.toThrow()
})
