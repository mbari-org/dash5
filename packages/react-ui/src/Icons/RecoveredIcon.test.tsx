import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RecoveredIcon, RecoveredIconProps } from './RecoveredIcon'

const props: RecoveredIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<RecoveredIcon {...props} />)).not.toThrow()
})
