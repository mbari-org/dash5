import React, { useCallback, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  faCog,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
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

export type SectionKey = 'pic' | 'resources' | 'training' | 'admin'

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
  /** Which sections start expanded. Defaults to ['pic']. */
  defaultExpandedSections?: SectionKey[]
}

const styles = {
  panel:
    'absolute right-0 top-full mt-1 z-[1001] min-w-[240px] rounded-md bg-white font-display drop-shadow-lg border border-solid border-stone-300 pt-3',
  sectionToggle:
    'flex w-full items-start justify-between px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-800 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-secondary-500',
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
        // Plain non-interactive span for disabled items — no role to avoid misleading AT
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
        // Composite key ensures a unique React key within the section even if URLs repeat
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

const CollapsibleSection: React.FC<{
  label: string
  sectionId: string
  expanded: boolean
  onToggle: () => void
  divider?: boolean
  headerIcon?: React.ReactNode
  testIdPrefix: string
  links: ResourceLink[]
}> = ({
  label,
  sectionId,
  expanded,
  onToggle,
  divider,
  headerIcon,
  testIdPrefix,
  links,
}) => {
  const [hovered, setHovered] = useState(false)
  const contentId = `${sectionId}-content`
  return (
    <section aria-label={label} className={clsx(divider && styles.divider)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={expanded ? contentId : undefined}
        className={styles.sectionToggle}
        style={{ backgroundColor: hovered ? '#CFDEE2' : '#E4EDF0' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-testid={`${testIdPrefix}-header`}
      >
        <span className="flex flex-1 items-start gap-1">
          {headerIcon}
          {label}
        </span>
        <FontAwesomeIcon
          icon={expanded ? faChevronUp : faChevronDown}
          className="mt-0.5 flex-shrink-0 text-[10px] opacity-60"
          aria-hidden
        />
      </button>
      {expanded && (
        <div id={contentId}>
          <LinkList links={links} testIdPrefix={testIdPrefix} />
        </div>
      )}
    </section>
  )
}

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
  defaultExpandedSections = ['pic'],
}) => {
  const [open, setOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    () => new Set(defaultExpandedSections)
  )
  const ref = useRef<HTMLDivElement | null>(null)
  // Stable callback prevents useOnClickOutside from re-registering listeners
  const closeDropdown = useCallback(() => setOpen(false), [])
  useOnClickOutside(ref, closeDropdown)

  // Unique id per instance so aria-controls works correctly when rendered
  // more than once on the same page
  const panelId = useId()

  const toggleSection = useCallback((key: SectionKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

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
          ariaControls={open ? panelId : undefined}
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
            <CollapsibleSection
              label="LRAUV PIC Signup"
              sectionId={`${panelId}-pic`}
              expanded={expandedSections.has('pic')}
              onToggle={() => toggleSection('pic')}
              testIdPrefix="pic-link"
              links={picLinks}
            />
          )}
          {hasResources && (
            <CollapsibleSection
              label={resourcesSectionLabel}
              sectionId={`${panelId}-resources`}
              expanded={expandedSections.has('resources')}
              onToggle={() => toggleSection('resources')}
              divider={hasPic}
              testIdPrefix="resource-link"
              links={resourceLinks}
            />
          )}
          {hasTraining && (
            <CollapsibleSection
              label={trainingSectionLabel}
              sectionId={`${panelId}-training`}
              expanded={expandedSections.has('training')}
              onToggle={() => toggleSection('training')}
              divider={hasPic || hasResources}
              testIdPrefix="training-link"
              links={trainingLinks}
            />
          )}
          {hasAdminSection && (
            <CollapsibleSection
              label="Admin Settings"
              sectionId={`${panelId}-admin`}
              expanded={expandedSections.has('admin')}
              onToggle={() => toggleSection('admin')}
              divider={hasPic || hasResources || hasTraining}
              headerIcon={
                <FontAwesomeIcon
                  icon={faCog}
                  className="mr-1 text-[10px]"
                  aria-hidden
                />
              }
              testIdPrefix="admin-link"
              links={adminLinks}
            />
          )}
        </div>
      )}
    </div>
  )
}

ResourcesDropdown.displayName = 'Dropdowns.ResourcesDropdown'
