import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UploadIcon, UploadIconProps } from './UploadIcon'

const props: UploadIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<UploadIcon {...props} />)).not.toThrow()
})
