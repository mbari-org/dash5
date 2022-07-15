import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EndIcon, EndIconProps } from './EndIcon'

const props: EndIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<EndIcon {...props} />)).not.toThrow()
})
