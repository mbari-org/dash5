import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LogsToolbar } from './LogsToolbar'

// Mock the icons to avoid SVG rendering issues in tests
jest.mock('../Icons', () => ({
  HistoricalListIcon: () => <div data-testid="historical-list-icon" />,
  SubIcon: () => <div data-testid="sub-icon" />,
}))

// Mock FontAwesome icons
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faSync: 'mockFaSyncIcon',
  faGripLines: 'mockFaGripLinesIcon',
  faAlignJustify: 'mockFaAlignJustifyIcon',
}))

const defaultProps = {
  deploymentLogsOnly: false,
  toggleDeploymentLogsOnly: jest.fn(),
  disabled: false,
  handleRefresh: jest.fn(),
}

describe('LogsToolbar', () => {
  test('renders without crashing', () => {
    expect(() => render(<LogsToolbar {...defaultProps} />)).not.toThrow()
  })

  test('displays both icons', () => {
    render(<LogsToolbar {...defaultProps} />)
    expect(screen.getByTestId('historical-list-icon')).toBeInTheDocument()
    expect(screen.getByTestId('sub-icon')).toBeInTheDocument()
  })

  test('calls toggleDeploymentLogsOnly when toggle is clicked', () => {
    render(<LogsToolbar {...defaultProps} />)
    const toggle = screen.getByRole('button', { name: /displaying all logs/i })
    fireEvent.click(toggle)
    expect(defaultProps.toggleDeploymentLogsOnly).toHaveBeenCalledTimes(1)
  })

  test('calls handleRefresh when refresh button is clicked', () => {
    render(<LogsToolbar {...defaultProps} />)
    const refreshButton = screen.getByRole('button', { name: /reload/i })
    fireEvent.click(refreshButton)
    expect(defaultProps.handleRefresh).toHaveBeenCalledTimes(1)
  })

  test('renders lastUpdatedDuration when provided', () => {
    render(<LogsToolbar {...defaultProps} lastUpdatedDuration="2m" />)
    // Text is split across 3 stacked spans: "Updated" / "2m" / "ago"
    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('2m')).toBeInTheDocument()
    expect(screen.getByText('ago')).toBeInTheDocument()
  })

  test('does not render last-updated text when lastUpdatedDuration is omitted', () => {
    render(<LogsToolbar {...defaultProps} />)
    expect(screen.queryByText(/updated/i)).not.toBeInTheDocument()
  })

  test('renders compact toggle button when onToggleCompact is provided', () => {
    const onToggleCompact = jest.fn()
    render(<LogsToolbar {...defaultProps} onToggleCompact={onToggleCompact} />)
    expect(
      screen.getByRole('button', { name: /compact view/i })
    ).toBeInTheDocument()
  })

  test('compact toggle shows comfortable view label when compact is true', () => {
    const onToggleCompact = jest.fn()
    render(
      <LogsToolbar
        {...defaultProps}
        compact
        onToggleCompact={onToggleCompact}
      />
    )
    expect(
      screen.getByRole('button', { name: /comfortable view/i })
    ).toBeInTheDocument()
  })

  test('calls onToggleCompact when compact toggle is clicked', () => {
    const onToggleCompact = jest.fn()
    render(<LogsToolbar {...defaultProps} onToggleCompact={onToggleCompact} />)
    fireEvent.click(screen.getByRole('button', { name: /compact view/i }))
    expect(onToggleCompact).toHaveBeenCalledTimes(1)
  })

  test('does not render compact toggle when onToggleCompact is omitted', () => {
    render(<LogsToolbar {...defaultProps} />)
    expect(
      screen.queryByRole('button', { name: /compact view/i })
    ).not.toBeInTheDocument()
  })
})
