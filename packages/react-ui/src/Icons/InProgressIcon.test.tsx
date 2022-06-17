import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { InProgressIcon, InProgressIconProps } from './InProgressIcon'

const props: InProgressIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<InProgressIcon {...props} />)).not.toThrow()
})
