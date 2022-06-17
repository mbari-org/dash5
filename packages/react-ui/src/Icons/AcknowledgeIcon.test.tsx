import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AcknowledgeIcon, AcknowledgeIconProps } from './AcknowledgeIcon'

const props: AcknowledgeIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<AcknowledgeIcon {...props} />)).not.toThrow()
})
