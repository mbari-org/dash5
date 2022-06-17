import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { NotConnectedIcon, NotConnectedIconProps } from './NotConnectedIcon'

const props: NotConnectedIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<NotConnectedIcon {...props} />)).not.toThrow()
})
