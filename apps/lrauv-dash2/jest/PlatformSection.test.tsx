import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { GetPlatformsResponse } from '@mbari/api-client'
import { PlatformSection } from '../components/PlatformSection'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}))

const paragon: GetPlatformsResponse = {
  _id: 'plat-paragon',
  name: 'R/V Paragon',
  abbreviation: 'PRG',
  typeName: 'Ship',
  color: '#00ffff',
  iconUrl: null,
}

const baseProps = {
  name: 'Ship',
  items: [paragon],
  selectedIds: [] as string[],
  onToggleSelect: jest.fn(),
  expanded: true,
}

describe('PlatformSection center-map button', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render a center-map button when onCenterClick is omitted', () => {
    render(<PlatformSection {...baseProps} />)

    expect(
      screen.queryByRole('button', { name: 'Center map on R/V Paragon' })
    ).not.toBeInTheDocument()
  })

  it('renders a center-map button and passes the platform id on click', async () => {
    const onCenterClick = jest.fn()
    render(<PlatformSection {...baseProps} onCenterClick={onCenterClick} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(onCenterClick).toHaveBeenCalledTimes(1)
    expect(onCenterClick).toHaveBeenCalledWith('plat-paragon')
  })

  it('prefetches on hover when onCenterHover is provided', async () => {
    const onCenterClick = jest.fn()
    const onCenterHover = jest.fn()
    render(
      <PlatformSection
        {...baseProps}
        onCenterClick={onCenterClick}
        onCenterHover={onCenterHover}
      />
    )

    await userEvent.hover(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(onCenterHover).toHaveBeenCalledWith('plat-paragon')
    expect(onCenterClick).not.toHaveBeenCalled()
  })

  it('does not toggle selection when the center-map button is clicked', async () => {
    const onCenterClick = jest.fn()
    const onToggleSelect = jest.fn()
    render(
      <PlatformSection
        {...baseProps}
        selectedIds={['plat-paragon']}
        onlySelected
        onToggleSelect={onToggleSelect}
        onCenterClick={onCenterClick}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Center map on R/V Paragon' })
    )

    expect(onCenterClick).toHaveBeenCalledWith('plat-paragon')
    expect(onToggleSelect).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
