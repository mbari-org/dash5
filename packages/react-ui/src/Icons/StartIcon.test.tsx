import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StartIcon, StartIconProps } from './StartIcon'

const props: StartIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<StartIcon {...props} />)).not.toThrow()
})
