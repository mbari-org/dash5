import React from 'react'
import clsx from 'clsx'
import {
  faSync,
  faGripLines,
  faAlignJustify,
} from '@fortawesome/free-solid-svg-icons'
import { IconToggle } from '../Indicators'
import { IconButton } from '../Navigation'
import { HistoricalListIcon, SubIcon } from '../Icons'

export interface LogsToolbarProps {
  deploymentLogsOnly: boolean
  toggleDeploymentLogsOnly: () => void
  disabled: boolean
  handleRefresh: () => void
  /** Compact relative string for the last successful fetch, e.g. "2m ago". */
  lastUpdatedAgo?: string
  /** When true, the log list is rendered in compact/dense mode. */
  compact?: boolean
  /** Called when the user toggles compact mode. */
  onToggleCompact?: () => void
  className?: string
}

export const LogsToolbar: React.FC<LogsToolbarProps> = ({
  deploymentLogsOnly,
  toggleDeploymentLogsOnly,
  disabled,
  handleRefresh,
  lastUpdatedAgo,
  compact = false,
  onToggleCompact,
  className,
}) => (
  <div className={clsx('flex items-center gap-3', className)}>
    <IconToggle
      iconLeft={
        <HistoricalListIcon
          className={clsx(
            'transition-colors duration-300',
            deploymentLogsOnly ? 'text-gray-400' : 'text-black'
          )}
        />
      }
      iconRight={
        <SubIcon
          className={clsx(
            'transition-colors duration-300',
            deploymentLogsOnly ? 'text-black' : 'text-gray-400'
          )}
        />
      }
      isToggled={deploymentLogsOnly}
      onToggle={toggleDeploymentLogsOnly}
      tooltip={
        deploymentLogsOnly
          ? 'Displaying deployment logs'
          : 'Displaying all logs'
      }
      tooltipAlignment="right"
      ariaLabelLeft="Displaying all logs"
      ariaLabelRight="Displaying deployment logs"
      className="mr-4"
      disabled={disabled}
    />

    {lastUpdatedAgo && (
      <span className="text-xs text-stone-400" aria-live="polite">
        Updated {lastUpdatedAgo}
      </span>
    )}

    {onToggleCompact && (
      <IconButton
        icon={compact ? faAlignJustify : faGripLines}
        ariaLabel={compact ? 'comfortable view' : 'compact view'}
        tooltipAlignment="right"
        tooltip={
          compact ? 'Switch to comfortable view' : 'Switch to compact view'
        }
        onClick={onToggleCompact}
        size="text-md"
        iconClassName={clsx(
          'text-xl',
          compact ? 'text-blue-500' : 'text-gray-400'
        )}
        className="flex items-center justify-center"
      />
    )}

    <IconButton
      icon={faSync}
      ariaLabel="reload"
      tooltipAlignment="right"
      tooltip="Refresh logs"
      disabled={disabled}
      onClick={handleRefresh}
      size="text-md"
      iconClassName="text-xl"
      className="flex items-center justify-center rounded-full border-2 border-blue-400 text-blue-400"
    />
  </div>
)

LogsToolbar.displayName = 'Toolbars.LogsToolbar'
