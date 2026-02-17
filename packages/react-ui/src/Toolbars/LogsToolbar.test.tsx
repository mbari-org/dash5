import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LogsToolbar } from './LogsToolbar'

// Mock the icons to avoid SVG rendering issues in tests
jest.mock('../Icons', () => ({
  HistoricalListIcon: () => <div data-testid="historical-list-icon" />,
  SubIcon: () => <div data-testid="sub-icon" />,
}))

// Mock FontAwesome icon
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faSync: 'mockFaSyncIcon',
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
})
