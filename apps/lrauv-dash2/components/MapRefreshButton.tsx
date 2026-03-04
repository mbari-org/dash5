import React from 'react'
import { RefreshButton } from '@mbari/react-ui'

const REFRESH_BUTTON_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '12px',
  left: '68px',
  zIndex: 1000,
}

const DEFAULT_TOOLTIP_PREAMBLE = 'Reload LRAUV positions'
const DEFAULT_AUTO_REFRESH_MINUTES = 10

export interface MapRefreshButtonProps {
  onClick: () => void | Promise<unknown>
  loading?: boolean
  lastRefreshed?: Date | null
  autoRefreshMinutes?: number
  tooltipPreamble?: string
}

export const MapRefreshButton: React.FC<MapRefreshButtonProps> = ({
  onClick,
  loading = false,
  lastRefreshed,
  autoRefreshMinutes = DEFAULT_AUTO_REFRESH_MINUTES,
  tooltipPreamble = DEFAULT_TOOLTIP_PREAMBLE,
}) => (
  <div style={REFRESH_BUTTON_STYLE}>
    <RefreshButton
      onClick={onClick}
      loading={loading}
      lastRefreshed={lastRefreshed}
      autoRefreshMinutes={autoRefreshMinutes}
      tooltipPreamble={tooltipPreamble}
    />
  </div>
)
