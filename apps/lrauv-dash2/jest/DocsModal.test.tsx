import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { DocsModal } from '../components/DocsModal'

jest.mock('../components/DocsSection', () => ({
  __esModule: true,
  default: ({
    vehicleName,
    authenticated,
  }: {
    vehicleName: string
    authenticated?: boolean
  }) => (
    <div
      data-testid="docs-section"
      data-vehicle={vehicleName}
      data-authenticated={authenticated ? 'true' : 'false'}
    />
  ),
}))

describe('DocsModal auth gating (fix #786)', () => {
  it('passes authenticated=true through to DocsSection', () => {
    render(<DocsModal vehicleName="pontus" authenticated />)
    const section = screen.getByTestId('docs-section')
    expect(section).toHaveAttribute('data-authenticated', 'true')
    expect(section).toHaveAttribute('data-vehicle', 'pontus')
  })

  it('passes authenticated=false through to DocsSection when logged out', () => {
    render(<DocsModal vehicleName="pontus" authenticated={false} />)
    expect(screen.getByTestId('docs-section')).toHaveAttribute(
      'data-authenticated',
      'false'
    )
  })
})
