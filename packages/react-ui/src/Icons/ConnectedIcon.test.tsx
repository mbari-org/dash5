import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConnectedIcon, ConnectedIconProps } from './ConnectedIcon'

const props: ConnectedIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<ConnectedIcon {...props} />)).not.toThrow()
})
