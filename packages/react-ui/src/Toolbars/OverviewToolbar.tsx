import React, { useState } from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faClipboardList,
  faPlus,
} from '@fortawesome/pro-regular-svg-icons'
import { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core'
import { AccessoryButton } from '../Navigation/AccessoryButton'
import { capitalize, swallow } from '@mbari/utils'
import { Dropdown } from '../Navigation'
import { DateTime } from 'luxon'
import { IconButton } from '../Navigation'

export interface DeploymentInfo {
  id: string
  name: string
  unixTime?: number
}
export interface OverviewToolbarProps {
  className?: string
  style?: React.CSSProperties
  vehicleName?: string
  deployment?: DeploymentInfo
  pilotInCharge: string
  pilotOnCall?: string
  btnIcon?: IconDefinition
  supportIcon1?: JSX.Element
  supportIcon2?: JSX.Element
  open?: boolean
  onSelectNewDeployment?: () => void
  onEditDeployment?: () => void
  onClickPilot: () => void
  onIcon1hover?: () => JSX.Element
  onIcon2hover?: () => JSX.Element
  deployments?: DeploymentInfo[]
  onSelectDeployment?: (deployment: DeploymentInfo) => void
}

const styles = {
  container: 'flex font-display bg-white px-4 py-2',
  leftWrapper: 'flex flex-grow items-center px-2',
  rightWrapper: 'flex items-center px-2',
  chevron: 'pl-4 text-xs',
  title: 'text-2xl font-semibold',
  interactive: 'cursor-pointer underline underline-offset-4',
  deployment: 'items-center py-4 pr-2',
  popover: 'top-100 absolute right-0 min-w-[400px] z-[1001]',
  dropdown:
    'top-100 absolute left-0 z-[1001] min-w-[230px] max-h-[50vh] overflow-y-auto',
}

type HoverOption = 'icon1' | 'icon2' | null

export const OverviewToolbar: React.FC<OverviewToolbarProps> = ({
  className,
  style,
  deployment,
  vehicleName,
  pilotInCharge,
  pilotOnCall,
  btnIcon,
  supportIcon1,
  supportIcon2,
  onSelectNewDeployment: handleNewDeployment,
  onSelectDeployment: handleSelectDeployment,
  deployments,
  onEditDeployment,
  onClickPilot,
  onIcon1hover,
  onIcon2hover,
}) => {
  const [hovering, setHovering] = useState<HoverOption>(null)
  const [showDeployments, setShowDeployments] = useState(false)
  const handleToggle = swallow(() => {
    setShowDeployments(!showDeployments)
  })

  const newDeploymentOptions = [
    {
      label: `New ${capitalize(vehicleName ?? '')} deployment`,
      icon: faPlus as IconDefinition,
      onSelect: () => {
        handleNewDeployment?.()
        setShowDeployments(false)
      },
      disabled: !handleNewDeployment,
    },
  ]
  const deploymentOptions =
    deployments?.map((d) => ({
      label: d.name,
      onSelect: () => {
        handleSelectDeployment?.(d)
        setShowDeployments(false)
      },
    })) ?? []

  const toggleHover = (newHover: HoverOption) => () => {
    setHovering(newHover)
  }
  return (
    <article style={style} className={clsx(styles.container, className, '')}>
      <ul className={styles.leftWrapper}>
        <li className="relative">
          {handleSelectDeployment || handleNewDeployment ? (
            <button
              onClick={handleToggle}
              className={styles.deployment}
              data-testid="deploymentToggle"
            >
              <span
                aria-label="deployment title"
                className={clsx(styles.title, styles.interactive)}
              >
                {deployment?.name ?? '...'}
              </span>
              <span className={styles.chevron}>
                <FontAwesomeIcon icon={faChevronDown as IconProp} />
              </span>
            </button>
          ) : (
            <h2 className={styles.deployment} data-testid="deploymentHeadline">
              <span aria-label="deployment title" className={styles.title}>
                {deployment?.name ?? '...'}
              </span>
            </h2>
          )}
          {showDeployments && (
            <Dropdown
              options={[...newDeploymentOptions, ...deploymentOptions]}
              className={styles.dropdown}
              header={
                <ul>
                  {deployment?.unixTime && (
                    <li>
                      Started{' '}
                      {DateTime.fromMillis(deployment.unixTime).toRelative()}
                    </li>
                  )}
                  {deployment?.name && (
                    <li className="font-medium">{deployment.name}</li>
                  )}
                </ul>
              }
            />
          )}
        </li>
        {onEditDeployment ? (
          <li data-testid="deploymentDetails" className="ml-2">
            <IconButton
              icon={faClipboardList}
              onClick={onEditDeployment}
              ariaLabel="Deployment Details"
              tooltip="Deployment Details"
              size="text-2xl"
            />
          </li>
        ) : null}
      </ul>
      <ul className={styles.rightWrapper}>
        <li className="pr-2">
          <AccessoryButton
            label={pilotInCharge}
            secondary={pilotOnCall}
            icon={btnIcon as IconProp}
            onClick={swallow(onClickPilot)}
            isActive={true}
          />
        </li>
        {onIcon1hover && supportIcon1 ? (
          <li className="relative p-4">
            <button
              onMouseOver={toggleHover('icon1')}
              onFocus={toggleHover('icon1')}
              onMouseOut={toggleHover(null)}
              onBlur={toggleHover(null)}
              data-testid="icon1"
            >
              {supportIcon1}
            </button>
            {hovering === 'icon1' && (
              <div className={styles.popover} data-testid="icon1detail">
                {onIcon1hover()}
              </div>
            )}
          </li>
        ) : null}
        {onIcon2hover && supportIcon2 ? (
          <li className="relative">
            <button
              onMouseOver={toggleHover('icon2')}
              onFocus={toggleHover('icon2')}
              data-testid="icon2"
              onMouseOut={toggleHover(null)}
              onBlur={toggleHover(null)}
            >
              {supportIcon2}
            </button>
            {hovering === 'icon2' && (
              <div className={styles.popover} data-testid="icon2detail">
                {onIcon2hover()}
              </div>
            )}
          </li>
        ) : null}
      </ul>
    </article>
  )
}

OverviewToolbar.displayName = 'Components.OverviewToolbar'
