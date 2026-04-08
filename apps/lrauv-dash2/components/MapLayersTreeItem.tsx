import React from 'react'
import clsx from 'clsx'
import Tippy from '@tippyjs/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faCaretRight,
  faStar,
  faArrowsToCircle,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'

export interface TreeItemProps {
  label: string
  isExpanded?: boolean
  isChecked?: boolean
  onToggleExpand?: () => void
  onToggleCheck?: () => void
  icon?: IconProp
  iconColor?: string
  children?: React.ReactNode
  disabled?: boolean
  disabledTitle?: string
  isStarred?: boolean
  onStarClick?: () => void
  onMouseEnterStar?: () => void
  onMouseLeaveStar?: () => void
  onCenterClick?: () => void
  centerLabel?: string
}

const CustomCircleIcon = () => (
  <div
    className="mr-2 inline-block"
    style={{
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: '#e3f2fd',
      border: '4px solid #FFD700',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}
  />
)

export const TreeItem: React.FC<TreeItemProps> = ({
  label,
  isExpanded = true,
  isChecked = false,
  onToggleExpand,
  onToggleCheck,
  icon,
  iconColor,
  children,
  disabled = false,
  disabledTitle,
  isStarred,
  onStarClick,
  onMouseEnterStar,
  onMouseLeaveStar,
  onCenterClick,
  centerLabel = 'Center map on this item',
}) => {
  const hasChildren = React.Children.count(children) > 0

  return (
    <article className="tree-item">
      <div className="flex items-center py-2 pl-2">
        {hasChildren ? (
          <button
            onClick={onToggleExpand}
            className="mr-1 flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <FontAwesomeIcon
              icon={faCaretRight}
              size="sm"
              className={clsx(
                'transition-transform duration-200 ease-in-out motion-reduce:transition-none',
                isExpanded ? 'rotate-90' : 'rotate-0'
              )}
            />
          </button>
        ) : (
          <div className="tree-connector-wrapper ml-4 flex items-center">
            <span className="tree-connector -ml-9 mr-2 inline-block h-0.5 w-7 rounded bg-stone-400" />
          </div>
        )}

        <label
          className={clsx(
            'flex w-full items-center',
            disabled || !onToggleCheck
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer'
          )}
          title={disabled ? disabledTitle ?? 'Not available' : undefined}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggleCheck}
            readOnly={!onToggleCheck}
            disabled={disabled || !onToggleCheck}
            className="mapLayersCheckbox mr-2 h-5 w-5 accent-blue-600"
            style={{
              cursor: disabled || !onToggleCheck ? 'not-allowed' : 'pointer',
            }}
          />
          {icon ? (
            icon === faCircle && iconColor === 'white' ? (
              <CustomCircleIcon />
            ) : (
              <FontAwesomeIcon
                icon={icon}
                className="mr-2"
                style={{ color: iconColor || undefined }}
              />
            )
          ) : null}
          {onStarClick !== undefined && (!disabled || isStarred) && (
            <Tippy
              content={
                isStarred
                  ? 'Hover to spotlight on map'
                  : 'Click to enable spotlight'
              }
              placement="top-start"
              appendTo="parent"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onStarClick()
                }}
                onMouseEnter={onMouseEnterStar}
                onMouseLeave={onMouseLeaveStar}
                className="mr-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label={isStarred ? 'Unstar station' : 'Star station'}
                aria-pressed={isStarred}
                style={{
                  width: '22px',
                  height: '22px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  background: '#fff',
                  border: 0,
                  padding: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon
                  icon={faStar}
                  style={{
                    color: isStarred ? '#FFD700' : '#9ca3af',
                    fontSize: '14px',
                  }}
                />
              </button>
            </Tippy>
          )}
          <span className="text-sm font-medium">{label}</span>
          {onCenterClick !== undefined && (
            <Tippy
              content={centerLabel}
              placement="top-start"
              appendTo="parent"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onCenterClick()
                }}
                className="ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label={centerLabel}
                style={{
                  width: '20px',
                  height: '20px',
                  flexShrink: 0,
                  borderRadius: '3px',
                  background: '#fff',
                  border: 0,
                  padding: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon
                  icon={faArrowsToCircle}
                  style={{ color: '#6b7280', fontSize: '14.5px' }}
                />
              </button>
            </Tippy>
          )}
        </label>
      </div>

      {hasChildren && (
        <div
          className={clsx(
            'grid transition-[grid-template-rows] duration-200 ease-in-out motion-reduce:transition-none',
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <ul className="children-container relative ml-[10px] overflow-hidden pl-[12px]">
            {React.Children.toArray(children).map((child, idx, arr) => {
              const isLast = idx === arr.length - 1
              const childKey = React.isValidElement<{ label?: string }>(child)
                ? child.key ?? child.props.label ?? String(idx)
                : String(idx)
              return (
                <li
                  key={childKey}
                  className="tree-row relative flex items-start"
                >
                  <span
                    aria-hidden
                    className="absolute -left-3 top-0 w-0.5 bg-stone-400"
                    style={{ bottom: isLast ? '50%' : 0 }}
                  />
                  {child}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </article>
  )
}
