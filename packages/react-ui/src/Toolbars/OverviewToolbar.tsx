import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faClipboardList,
} from '@fortawesome/pro-regular-svg-icons'
import { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core'
import { AccessoryButton } from '../Navigation/AccessoryButton'
import { swallow } from '@mbari/utils'

export interface OverviewToolbarProps {
  className?: string
  style?: React.CSSProperties
  deployment: string
  pilotInCharge: string
  pilotOnCall?: string
  btnIcon?: IconDefinition
  supportIcon1?: JSX.Element
  supportIcon2?: JSX.Element
  open?: boolean
  onClickDeployment: (open: boolean) => void
  onClickMissions: () => void
  onClickPilot: () => void
  onIcon1hover?: () => JSX.Element
  onIcon2hover?: () => JSX.Element
}

const styles = {
  container: 'flex font-display bg-white px-4 py-2',
  leftWrapper: 'flex flex-grow items-center px-2',
  rightWrapper: 'flex items-center px-2',
  chevron: 'pl-4 text-xs',
  title: 'text-2xl font-semibold underline underline-offset-4',
  deployment: 'items-center py-4 pr-2',
}

export const OverviewToolbar: React.FC<OverviewToolbarProps> = ({
  className,
  style,
  deployment,
  pilotInCharge,
  pilotOnCall,
  btnIcon,
  open,
  supportIcon1,
  supportIcon2,
  onClickDeployment,
  onClickMissions,
  onClickPilot,
  onIcon1hover,
  onIcon2hover,
}) => {
  const handleToggle = swallow(() => {
    onClickDeployment(!open)
  })

  return (
    <article style={style} className={clsx(styles.container, className, '')}>
      <ul className={styles.leftWrapper}>
        <li>
          <button onClick={handleToggle} className={styles.deployment}>
            <span aria-label="deployment title" className={styles.title}>
              {deployment}
            </span>
            <span className={styles.chevron}>
              <FontAwesomeIcon icon={faChevronDown as IconProp} />
            </span>
          </button>
        </li>
        <li>
          <button className="p-2 text-2xl" onClick={swallow(onClickMissions)}>
            <FontAwesomeIcon
              icon={faClipboardList as IconProp}
              title="checklist icon"
            ></FontAwesomeIcon>
          </button>
        </li>
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
        <li className="p-4">
          <button onMouseOver={onIcon1hover} onFocus={onIcon1hover}>
            {supportIcon1}
          </button>
        </li>
        <li>
          <button onMouseOver={onIcon2hover} onFocus={onIcon2hover}>
            {supportIcon2}
          </button>
        </li>
      </ul>
    </article>
  )
}

OverviewToolbar.displayName = 'Components.OverviewToolbar'
