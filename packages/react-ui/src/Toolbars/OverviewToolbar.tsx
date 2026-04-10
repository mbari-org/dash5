import React, { useState } from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faClipboardList,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core'
import { capitalize, swallow } from '@mbari/utils'
import {
  Dropdown,
  IconButton,
  RecoveredPill,
  RoleReassignButton,
} from '../Navigation'
import { ResourceLink, ResourcesDropdown } from '../Dropdowns/ResourcesDropdown'
import { DateTime } from 'luxon'

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
  pics?: string[]
  onCalls?: string[]
  currentUserName?: string
  supportIcon1?: JSX.Element
  supportIcon2?: JSX.Element
  open?: boolean
  onSelectNewDeployment?: () => void
  onEditDeployment?: () => void
  onRoleReassign?: () => void
  onIcon1hover?: () => JSX.Element
  onIcon2hover?: () => JSX.Element
  deployments?: DeploymentInfo[]
  authenticated?: boolean
  loadingPicAndOnCall?: boolean
  onSelectDeployment?: (deployment: DeploymentInfo) => void
  recovered?: boolean
  recoveredAt?: string
  resourceLinks?: ResourceLink[]
  trainingLinks?: ResourceLink[]
  adminLinks?: ResourceLink[]
  isAdmin?: boolean
  picLinks?: ResourceLink[]
  resourcesSectionLabel?: string
  trainingSectionLabel?: string
}

const styles = {
  container: 'flex font-display bg-white px-4 py-2 min-h-0',
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
  pics,
  onCalls,
  currentUserName,
  supportIcon1,
  supportIcon2,
  onSelectNewDeployment: handleNewDeployment,
  onSelectDeployment: handleSelectDeployment,
  deployments,
  onEditDeployment,
  onRoleReassign,
  onIcon1hover,
  onIcon2hover,
  authenticated,
  loadingPicAndOnCall,
  recovered,
  recoveredAt,
  resourceLinks,
  trainingLinks,
  adminLinks,
  isAdmin,
  picLinks,
  resourcesSectionLabel,
  trainingSectionLabel,
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
        {recovered && (
          <li className="ml-3 flex items-center">
            <RecoveredPill
              recoveredAt={recoveredAt}
              className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
            />
          </li>
        )}
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
        {onRoleReassign && (
          <li className="pr-2">
            <RoleReassignButton
              pics={pics}
              onCalls={onCalls}
              currentUserName={currentUserName}
              authenticated={authenticated}
              loading={loadingPicAndOnCall}
              onRoleReassign={onRoleReassign}
            />
          </li>
        )}
        {authenticated && (
          <li className="relative pr-2">
            <ResourcesDropdown
              picLinks={picLinks}
              resourceLinks={resourceLinks}
              resourcesSectionLabel={resourcesSectionLabel}
              trainingLinks={trainingLinks}
              trainingSectionLabel={trainingSectionLabel}
              adminLinks={adminLinks}
              isAdmin={isAdmin}
            />
          </li>
        )}
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
