import React, { useCallback, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { faFolder, faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { useOnClickOutside } from '@mbari/utils'
import { IconButton } from '../Navigation'

// url is optional when disabled — union type avoids callers providing dummy URLs
interface BaseResourceLink {
  label: string
  tooltip?: string
  icon?: IconDefinition
}

interface EnabledResourceLink extends BaseResourceLink {
  url: string
  disabled?: false
}

interface DisabledResourceLink extends BaseResourceLink {
  disabled: true
  url?: never
}

export type ResourceLink = EnabledResourceLink | DisabledResourceLink

export interface ResourcesDropdownProps {
  className?: string
  style?: React.CSSProperties
  picLinks?: ResourceLink[]
  resourceLinks?: ResourceLink[]
  resourcesSectionLabel?: string
  trainingLinks?: ResourceLink[]
  trainingSectionLabel?: string
  adminLinks?: ResourceLink[]
  isAdmin?: boolean
}

const styles = {
  panel:
    'top-100 absolute right-0 z-[1001] min-w-[240px] rounded-md bg-white font-display drop-shadow-lg border border-solid border-stone-300 pt-3',
  sectionHeader:
    'px-4 py-2 text-xs font-bold uppercase tracking-widest bg-secondary-300 text-stone-800',
  divider: 'border-t border-stone-200',
  link: 'flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-stone-100 focus:bg-stone-100 focus:outline-none',
  linkDisabled:
    'flex w-full items-center gap-2 px-4 py-3 text-left text-sm cursor-not-allowed opacity-40',
  linkLabel: 'flex-1',
}

const LinkList: React.FC<{
  links: ResourceLink[]
  testIdPrefix: string
}> = ({ links, testIdPrefix }) => (
  <ul>
    {links.map((link, i) =>
      link.disabled ? (
        // Render plain non-interactive text for disabled items (no role to avoid misleading AT)
        <li key={`${link.label}-${i}`}>
          <span
            aria-disabled="true"
            className={styles.linkDisabled}
            title={link.tooltip ?? 'Coming soon'}
            data-testid={`${testIdPrefix}-${i}`}
          >
            <span className="w-5 text-center text-stone-400">
              {link.icon && <FontAwesomeIcon icon={link.icon} aria-hidden />}
            </span>
            <span className={styles.linkLabel}>{link.label}</span>
          </span>
        </li>
      ) : (
        // Composite key guards against duplicate URLs in the same section
        <li key={`${link.url}-${i}`}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            title={link.tooltip}
            data-testid={`${testIdPrefix}-${i}`}
          >
            <span className="w-5 text-center text-stone-400">
              {link.icon && <FontAwesomeIcon icon={link.icon} aria-hidden />}
            </span>
            <span className={styles.linkLabel}>{link.label}</span>
          </a>
        </li>
      )
    )}
  </ul>
)

export const ResourcesDropdown: React.FC<ResourcesDropdownProps> = ({
  className,
  style,
  picLinks = [],
  resourceLinks = [],
  resourcesSectionLabel = 'Resources',
  trainingLinks = [],
  trainingSectionLabel = 'Training',
  adminLinks = [],
  isAdmin = false,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  // Stable callback prevents useOnClickOutside from re-registering listeners
  const closeDropdown = useCallback(() => setOpen(false), [])
  useOnClickOutside(ref, closeDropdown)

  // Unique id per instance so aria-controls works correctly when the component
  // is mounted more than once on the same page
  const panelId = useId()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }

  const hasPic = picLinks.length > 0
  const hasResources = resourceLinks.length > 0
  const hasTraining = trainingLinks.length > 0
  const hasAdminSection = isAdmin && adminLinks.length > 0
  const hasAnyLinks = hasPic || hasResources || hasTraining || hasAdminSection

  return (
    <div
      ref={ref}
      className={clsx('relative', className)}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div data-testid="resources-button">
        <IconButton
          icon={open ? faFolderOpen : faFolder}
          ariaLabel="LRAUV Resources"
          ariaExpanded={open}
          ariaControls={panelId}
          tooltip="LRAUV Resources"
          toolTipDirection="above"
          onClick={() => setOpen((o) => !o)}
        />
      </div>
      {open && (
        <div
          id={panelId}
          className={styles.panel}
          aria-label="Quick-access resources"
          data-testid="resources-panel"
        >
          {!hasAnyLinks && (
            <p className="px-4 py-3 text-sm text-stone-400">
              No resources configured.
            </p>
          )}
          {hasPic && (
            <section aria-label="LRAUV PIC Signup">
              <p className={styles.sectionHeader}>LRAUV PIC Signup</p>
              <LinkList links={picLinks} testIdPrefix="pic-link" />
            </section>
          )}
          {hasResources && (
            <section
              aria-label={resourcesSectionLabel}
              className={clsx(hasPic && styles.divider)}
            >
              <p className={styles.sectionHeader}>{resourcesSectionLabel}</p>
              <LinkList links={resourceLinks} testIdPrefix="resource-link" />
            </section>
          )}
          {hasTraining && (
            <section
              aria-label={trainingSectionLabel}
              className={clsx((hasPic || hasResources) && styles.divider)}
            >
              <p className={styles.sectionHeader}>{trainingSectionLabel}</p>
              <LinkList links={trainingLinks} testIdPrefix="training-link" />
            </section>
          )}
          {hasAdminSection && (
            <section
              aria-label="Admin Settings"
              className={clsx(
                (hasPic || hasResources || hasTraining) && styles.divider
              )}
            >
              <p className={styles.sectionHeader}>
                <FontAwesomeIcon
                  icon={faCog}
                  className="mr-1 text-xs"
                  aria-hidden
                />
                Admin Settings
              </p>
              <LinkList links={adminLinks} testIdPrefix="admin-link" />
            </section>
          )}
        </div>
      )}
    </div>
  )
}

ResourcesDropdown.displayName = 'Dropdowns.ResourcesDropdown'
