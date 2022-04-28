import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DownloadIcon, DownloadIconProps } from './DownloadIcon'

const props: DownloadIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<DownloadIcon {...props} />)).not.toThrow()
})
