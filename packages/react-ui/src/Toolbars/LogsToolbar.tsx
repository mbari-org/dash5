import React from 'react'
import clsx from 'clsx'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { IconToggle } from '../Indicators'
import { IconButton } from '../Navigation'
import { HistoricalListIcon, SubIcon } from '../Icons'

export interface LogsToolbarProps {
  deploymentLogsOnly: boolean
  toggleDeploymentLogsOnly: () => void
  disabled: boolean
  handleRefresh: () => void
  className?: string
}

export const LogsToolbar: React.FC<LogsToolbarProps> = ({
  deploymentLogsOnly,
  toggleDeploymentLogsOnly,
  disabled,
  handleRefresh,
  className,
}) => (
  <div className={clsx('flex items-center', className)}>
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
