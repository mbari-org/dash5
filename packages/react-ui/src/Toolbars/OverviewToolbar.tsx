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
  mission: string
  btnLabel: string
  btnIcon?: IconDefinition
  open?: boolean
  onToggle: (open: boolean) => void
  onUserSelect: () => void
}

const styles = {
  container: 'flex font-display bg-white px-4 py-2',
  chevronButton: 'px-4 text-xs',
  mission: 'text-2xl font-semibold underline underline-offset-4',
}

const networkIcon = (
  <svg
    width="40"
    height="26"
    viewBox="0 0 40 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.8398 24.5H8.83013C8.12677 24.5 7.6432 23.7931 7.89813 23.1375L11.335 14.3L14.7718 23.1375C15.0267 23.7931 14.5431 24.5 13.8398 24.5Z"
      stroke="#929292"
      strokeWidth="2"
    />
    <ellipse cx="11.3351" cy="11.8714" rx="1.7" ry="1.45714" fill="#929292" />
    <path
      d="M15.3018 9.44281L15.3784 9.70567C15.6984 10.8028 15.6984 11.9685 15.3784 13.0657L15.3018 13.3285"
      stroke="#929292"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15.3018 9.44281L15.3784 9.70567C15.6984 10.8028 15.6984 11.9685 15.3784 13.0657L15.3018 13.3285"
      stroke="#929292"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7.36829 13.3285L7.29162 13.0657C6.97162 11.9685 6.97162 10.8028 7.29162 9.70567L7.36829 9.44281"
      stroke="#929292"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18.7017 7.5L19.2026 9.00263C19.6131 10.2342 19.6131 11.5658 19.2026 12.7974L18.7017 14.3"
      stroke="#929292"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3.96844 14.3L3.46757 12.7974C3.05703 11.5658 3.05703 10.2342 3.46757 9.00262L3.96845 7.49999"
      stroke="#929292"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M1.83502 7.5L18.835 24.5"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="21.0434" y="14" width="3" height="11" rx="0.5" stroke="#929292" />
    <rect x="26.0434" y="10" width="3" height="15" rx="0.5" stroke="#929292" />
    <rect x="31.0434" y="5" width="3" height="20" rx="0.5" stroke="#929292" />
    <rect x="36.0434" y="1" width="3" height="24" rx="0.5" stroke="#929292" />
  </svg>
)

const LRAUVicon = (
  <svg
    width="31"
    height="27"
    viewBox="0 0 31 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.20371 23.7106L8.24253 23.7017L23.3342 23.5722C25.1348 23.5568 26.505 22.8159 27.3342 21.5989C28.079 20.5059 28.2267 19.2639 28.2195 18.4243C28.2094 17.2439 27.6812 16.0326 26.9159 15.1291C26.1273 14.1981 24.8682 13.347 23.2467 13.3609L15.1658 13.4302L15.1474 11.281L15.1302 9.28103L13.1303 9.29819L11.0506 9.31603L9.05066 9.33318L9.06781 11.3331L9.08625 13.4824L8.15495 13.4903L7.11612 13.4993L6.52605 14.3543L4.36976 17.4787L3.57129 18.6357L4.38948 19.7788L6.59905 22.8658L7.20371 23.7106ZM13.1659 13.4474L13.183 15.4473L15.183 15.4301L23.2638 15.3608C25.003 15.3459 26.2087 17.1782 26.2196 18.4414C26.2304 19.7046 25.7412 21.5515 23.3171 21.5723L8.22538 21.7017L6.01581 18.6147L8.1721 15.4903L9.1034 15.4823L11.1033 15.4651L11.0862 13.4652L11.0849 13.3159L11.0677 11.316L11.1475 11.3153L13.0677 11.2988L13.1474 11.2981L13.1646 13.298L13.1659 13.4474Z"
      fill="#6B7280"
    />
    <path
      d="M1.54337 23.5722C2.13697 23.2499 2.6861 22.8854 3.17326 22.5229C4.5004 21.5355 6.42205 21.4483 7.62129 22.5877V22.5877C8.7456 23.6559 10.5097 23.6559 11.634 22.5877L11.7295 22.4969C12.9074 21.3779 14.7555 21.3779 15.9334 22.4969V22.4969C17.1112 23.6159 18.9593 23.6159 20.1372 22.4969V22.4969C21.315 21.3779 23.1631 21.3779 24.341 22.4969V22.4969C25.5189 23.6159 27.3639 23.6114 28.6003 22.5574C29.0585 22.1667 29.5422 21.7696 30 21.4216"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M1.54337 22.5722C2.13697 22.2499 2.6861 21.8854 3.17326 21.5229C4.5004 20.5355 6.42205 20.4483 7.62129 21.5877V21.5877C8.7456 22.6559 10.5097 22.6559 11.634 21.5877L11.7295 21.4969C12.9074 20.3779 14.7555 20.3779 15.9334 21.4969V21.4969C17.1112 22.6159 18.9593 22.6159 20.1372 21.4969V21.4969C21.315 20.3779 23.1631 20.3779 24.341 21.4969V21.4969C25.5189 22.6159 27.3639 22.6114 28.6003 21.5574C29.0585 21.1667 29.5422 20.7696 30 20.4216"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M1.54337 25.5677C2.13697 25.2454 2.6861 24.8809 3.17326 24.5184C4.5004 23.531 6.42205 23.4438 7.62129 24.5832V24.5832C8.7456 25.6513 10.5097 25.6513 11.634 24.5832L11.7295 24.4924C12.9074 23.3733 14.7555 23.3733 15.9334 24.4924V24.4924C17.1112 25.6114 18.9593 25.6114 20.1372 24.4924V24.4924C21.315 23.3733 23.1631 23.3733 24.341 24.4924V24.4924C25.5189 25.6114 27.3639 25.6069 28.6003 24.5529C29.0585 24.1622 29.5422 23.765 30 23.4171"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15.5434 7.05098L16.4924 7.57695C17.065 7.89436 17.5172 8.38508 17.7807 8.97516L18.2173 9.95298"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.7384 2.37199L19.6184 4.13409C20.4212 4.62527 21.0675 5.32672 21.4838 6.15868L22.9775 9.14332"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export const OverviewToolbar: React.FC<OverviewToolbarProps> = ({
  className,
  style,
  mission,
  btnLabel,
  btnIcon,
  open,
  onToggle,
  onUserSelect,
}) => {
  const handleToggle = swallow(() => {
    onToggle(!open)
  })

  return (
    <article style={style} className={clsx(styles.container, className, '')}>
      <ul className="flex flex-grow items-center px-2">
        <li className={styles.mission}>{mission}</li>
        <li>
          <button className={styles.chevronButton} onClick={handleToggle}>
            <FontAwesomeIcon icon={faChevronDown as IconProp} />
          </button>
        </li>
        <li className="text-2xl">
          <FontAwesomeIcon icon={faClipboardList as IconProp}></FontAwesomeIcon>
        </li>
      </ul>
      <ul className="flex items-center px-2">
        <li className="pr-2">
          <AccessoryButton
            label={btnLabel}
            icon={btnIcon as IconProp}
            onClick={swallow(onUserSelect)}
          />
        </li>
        <li className="p-4">{networkIcon}</li>
        <li>{LRAUVicon}</li>
      </ul>
    </article>
  )
}

OverviewToolbar.displayName = 'Components.OverviewToolbar'
