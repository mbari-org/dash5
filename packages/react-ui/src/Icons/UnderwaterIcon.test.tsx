import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UnderwaterIcon, UnderwaterIconProps } from './UnderwaterIcon'

const props: UnderwaterIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<UnderwaterIcon {...props} />)).not.toThrow()
})
