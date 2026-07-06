import React, { useState } from 'react'
import clsx from 'clsx'
import { Modal, ModalPropsWithoutTitle } from '../Modal'
import { UnderwaterIcon } from '../Icons/UnderwaterIcon'
import { RecoveredIcon } from '../Icons/RecoveredIcon'
import { Table } from '../Data/Table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMaximize, faPen } from '@fortawesome/free-solid-svg-icons'
import { StartIcon } from '../Icons/StartIcon'
import { EndIcon } from '../Icons/EndIcon'
import { SummaryList } from '../Data/SummaryList'
import { capitalize, capitalizeSnakeCase, swallow } from '@mbari/utils'
import { IconButton } from '../Navigation'
import { DateTime } from 'luxon'
import { DateField, SelectField } from '../Fields'
import { SelectOption } from '../Fields/Select'
import { luxonValidTimezones } from '../Forms/NewDeploymentForm'

export interface DeploymentDetails {
  name: string
  gitTag?: string
  startDate?: string
  launchDate?: string
  recoverDate?: string
  endDate?: string
}

export type EventType = 'start' | 'launch' | 'recover' | 'end'

export interface DeploymentDetailsPopUpConfig {
  complete?: boolean
  queueSize: number
  tagOptions?: SelectOption[]
  logFiles?: string[]
  directoryListFilepath?: string
  onExpand?: () => void
  onSaveChanges: (details: DeploymentDetails) => void
  onChangeGitTag: (gitTag: string) => void
  onSetDeploymentEventToCurrentTime: (event: EventType) => void
}

export type DeploymentDetailsPopUpProps = DeploymentDetailsPopUpConfig &
  DeploymentDetails &
  ModalPropsWithoutTitle

interface EventCell {
  label: EventType
  icon: JSX.Element
  secondary?: string
}

const styles = {
  markTimeButton: 'rounded border-2 border-stone-400/60 py-1 px-2 text-sm',
  gitTag: 'my-4 flex items-center font-thin opacity-60',
  headerIcon: 'flex flex-col items-center justify-center opacity-40',
  timezoneSelector: 'flex w-full justify-end text-indigo-600 items-center',
  selectedTimezone: 'underline underline-offset-2',
}

export const DeploymentDetailsPopUp: React.FC<DeploymentDetailsPopUpProps> = ({
  className,
  style,
  name,
  gitTag,
  tagOptions,
  logFiles,
  directoryListFilepath,
  complete,
  queueSize,
  startDate,
  launchDate,
  recoverDate,
  endDate,
  onExpand,
  onSaveChanges,
  onSetDeploymentEventToCurrentTime,
  onClose,
  onChangeGitTag: handleChangeGitTag,
  ...props
}) => {
  const initialDeploymentValues = {
    name: name,
    gitTag: gitTag || '',
    startDate: startDate || '',
    launchDate: launchDate || '',
    recoverDate: recoverDate || '',
    endDate: endDate || '',
  }

  const [deployment, setDeployment] = useState<DeploymentDetails>(
    initialDeploymentValues
  )
  const [isSelectDateMode, setIsSelectDateMode] = useState(false)
  const [isSelectTagMode, setIsSelectTagMode] = useState(false)
  const [isSelectTimezoneMode, setIsSelectTimezoneMode] = useState(false)
  const [isLocal, setIsLocal] = useState(true)
  const [timezone, setTimezone] = useState<string | null>('')
  // Controls whether the start-date row shows the free-form DateField (true)
  // or the quick-pick buttons (false, the default when entering edit mode).
  const [showStartCustomPicker, setShowStartCustomPicker] = useState(false)

  const dateCell = (type: EventType) => {
    const eventDateLabel = `${type}Date`
    const eventDate =
      deployment[eventDateLabel as keyof DeploymentDetails] || ''

    const handleSetCurrentTime = () => {
      setDeployment({
        ...deployment,
        [`${type}Date`]: DateTime.now().toISO(),
      })
      onSetDeploymentEventToCurrentTime(type)
    }

    // Start date in edit mode: show quick-pick first, DateField only if
    // the user explicitly chooses "Custom date…"
    if (isSelectDateMode && type === 'start') {
      if (showStartCustomPicker) {
        return {
          label: (
            <div className="flex flex-col gap-1">
              <DateField
                name={eventDateLabel}
                timeZone={timezone && !isLocal ? timezone : undefined}
                className="text-sm"
                value={deployment[eventDateLabel as keyof DeploymentDetails]}
                onChange={(newValue: string) =>
                  setDeployment({
                    ...deployment,
                    [eventDateLabel as keyof DeploymentDetails]: newValue,
                  })
                }
                disabled={false}
              />
              <button
                className="text-xs text-indigo-600 underline"
                onClick={() => setShowStartCustomPicker(false)}
              >
                ← Back to quick options
              </button>
            </div>
          ),
          highlighted: true,
          span: 3,
        }
      }

      // Quick-pick buttons
      return {
        label: (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                className={styles.markTimeButton}
                onClick={() =>
                  setDeployment({
                    ...deployment,
                    startDate: DateTime.now().toISO(),
                  })
                }
                aria-label="set start time to now"
              >
                Now
              </button>
              <button
                className={styles.markTimeButton}
                onClick={() =>
                  setDeployment({
                    ...deployment,
                    startDate: DateTime.now().plus({ hours: 1 }).toISO(),
                  })
                }
                aria-label="set start time to one hour from now"
              >
                In 1 hour
              </button>
              <button
                className={styles.markTimeButton}
                onClick={() => setShowStartCustomPicker(true)}
                aria-label="pick a custom start date"
              >
                Custom date…
              </button>
            </div>
            {eventDate && DateTime.fromISO(eventDate) > DateTime.now() && (
              <span className="text-xs italic text-amber-600">
                Start is set in the future — GPS fixes won&apos;t appear until
                then.
              </span>
            )}
          </div>
        ),
        highlighted: true,
        span: 3,
      }
    }

    // All other events in edit mode: standard DateField
    if (isSelectDateMode) {
      return {
        label: (
          <DateField
            name={eventDateLabel}
            timeZone={timezone && !isLocal ? timezone : undefined}
            className="text-sm"
            value={deployment[eventDateLabel as keyof DeploymentDetails]}
            onChange={(newValue: string) =>
              setDeployment({
                ...deployment,
                [eventDateLabel as keyof DeploymentDetails]: newValue,
              })
            }
            disabled={!deployment[eventDateLabel as keyof DeploymentDetails]}
          />
        ),
        highlighted: true,
        span: 3,
      }
    }

    // Display mode: show formatted date or "Mark X time now" button
    const isFutureStart =
      type === 'start' &&
      !!eventDate &&
      DateTime.fromISO(eventDate) > DateTime.now()

    return eventDate
      ? {
          label: (
            <div className="flex flex-col gap-0.5">
              <span>
                {isLocal || !timezone
                  ? DateTime.fromJSDate(new Date(eventDate)).toLocaleString(
                      DateTime.DATETIME_FULL
                    )
                  : DateTime.fromJSDate(new Date(eventDate))
                      .setZone(timezone ?? undefined)
                      .toLocaleString(DateTime.DATETIME_FULL)}
              </span>
              {isFutureStart && (
                <span className="text-xs italic text-amber-600">
                  Start is in the future — GPS fixes won&apos;t appear until
                  then.
                </span>
              )}
            </div>
          ),
          span: 3,
        }
      : {
          label: (
            <button
              className={styles.markTimeButton}
              onClick={swallow(handleSetCurrentTime)}
              aria-label={`mark ${type} time now button`}
            >
              Mark {type} time now
            </button>
          ),
          highlighted: true,
          span: 3,
        }
  }

  const eventCell = ({ label, icon, secondary }: EventCell) => ({
    label: <span>{capitalize(label)}</span>,
    secondary: secondary ? (
      <span className="text-xs">{secondary}</span>
    ) : undefined,
    icon: icon,
    span: 2,
    fixedIconWidth: true,
  })

  const tableRows = (rows: EventCell[]) => {
    return rows.map(({ label, icon, secondary }) => ({
      cells: [eventCell({ label, icon, secondary }), dateCell(label)],
    }))
  }

  const handleConfirm = () => {
    setIsSelectDateMode(false)
    setShowStartCustomPicker(false)

    const nonEmptyKeys = Object.keys(deployment).filter(
      (key) => deployment[key as keyof DeploymentDetails] && key
    )

    const updatedDeployment = Object.fromEntries(
      nonEmptyKeys.map((key) => [
        [key as keyof DeploymentDetails],
        deployment[key as keyof DeploymentDetails],
      ])
    )
    onSaveChanges(updatedDeployment)
  }

  const handleSelect = (newValue: string | null) => {
    if (newValue) {
      const updatedTagDeployment = {
        ...deployment,
        gitTag: newValue ?? undefined,
      }
      setDeployment(updatedTagDeployment)
      handleChangeGitTag(newValue)
      setIsSelectTagMode(false)
    }
  }

  const handleCancel = () => {
    setIsSelectDateMode(false)
    setShowStartCustomPicker(false)
    setDeployment({ ...initialDeploymentValues, gitTag: deployment.gitTag })
  }

  return (
    <div className={clsx('', className)} style={style}>
      <Modal
        {...props}
        onConfirm={isSelectDateMode ? handleConfirm : null}
        onCancel={isSelectDateMode ? handleCancel : null}
        confirmButtonText="Save Changes"
        onClose={onClose}
        grayHeader
        title={
          <section className="ml-2 flex">
            <ul className="flex flex-grow flex-col">
              <li className="text-lg">{name}</li>
              <li className="font-thin opacity-60">
                {queueSize} mission{queueSize !== 1 && 's'} in queue
              </li>
              <li className={styles.gitTag}>
                <span className="mr-2">git tag:</span>
                <span className="font-mono text-lg">
                  {isSelectTagMode ? (
                    <SelectField
                      name="gitTag selector"
                      value={deployment.gitTag}
                      options={tagOptions}
                      onSelect={(newValue: string | null) =>
                        handleSelect(newValue)
                      }
                    />
                  ) : (
                    deployment.gitTag
                  )}
                </span>{' '}
                <IconButton
                  icon={faPen}
                  ariaLabel="edit git tag button"
                  onClick={() => setIsSelectTagMode(true)}
                />
              </li>
            </ul>
            <ul className={styles.headerIcon}>
              <li>
                {complete ? <RecoveredIcon large /> : <UnderwaterIcon large />}
              </li>
              <li>{complete ? 'Complete' : 'In Progress'}</li>
            </ul>
          </section>
        }
      >
        <Table
          scrollable
          grayHeader
          colInRow={5}
          header={{
            cells: [
              {
                label: (
                  <ul className="flex items-center">
                    <li className={styles.timezoneSelector}>
                      <button
                        aria-label="local time button"
                        className={clsx(
                          'mr-1',
                          isLocal && styles.selectedTimezone
                        )}
                        onClick={() => {
                          setIsLocal(true)
                          setIsSelectTimezoneMode(false)
                        }}
                      >
                        Local time
                      </button>
                      <span className="mx-1">/</span>
                      {isSelectTimezoneMode ? (
                        <SelectField
                          name="timezone selector"
                          options={luxonValidTimezones}
                          className="w-1/2"
                          placeholder="Local time"
                          value={timezone ?? ''}
                          onSelect={(id: string | null) => {
                            setTimezone(id)
                            setIsSelectTimezoneMode(false)
                          }}
                        />
                      ) : (
                        <button
                          aria-label="UTC time button"
                          className={clsx(
                            'ml-1',
                            !isLocal && styles.selectedTimezone
                          )}
                          onClick={() => {
                            setIsSelectTimezoneMode(true)
                            setIsLocal(false)
                          }}
                        >
                          {timezone
                            ? timezone
                                .split('/')
                                .map((w) => capitalizeSnakeCase(w))
                                .join('/')
                            : 'UTC'}
                        </button>
                      )}
                    </li>
                    {!isSelectDateMode && (
                      <li className="ml-4">
                        <IconButton
                          icon={faPen}
                          ariaLabel="edit dates button"
                          onClick={() => setIsSelectDateMode(true)}
                        />
                      </li>
                    )}
                  </ul>
                ),
                span: 5,
              },
            ],
          }}
          rows={tableRows([
            { label: 'start', icon: <StartIcon /> },
            {
              label: 'launch',
              secondary: 'Vehicle in water',
              icon: <UnderwaterIcon />,
            },
            {
              label: 'recover',
              secondary: 'Vehicle recovered',
              icon: <RecoveredIcon />,
            },
            { label: 'end', icon: <EndIcon /> },
          ])}
        />
        <SummaryList
          header={
            <section>
              <ul>
                <li>
                  <div className="mb-1 flex w-full justify-between">
                    <span className="font-display">
                      DIRECTORY LIST ({logFiles?.length ?? 0} LOG FILE
                      {logFiles?.length !== 1 && 'S'})
                    </span>
                    <span>
                      {onExpand && (
                        <button onClick={swallow(onExpand)}>
                          <FontAwesomeIcon
                            icon={faMaximize}
                            title="expand icon"
                          />
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="max-w-full truncate text-xs">
                    {directoryListFilepath}
                  </div>
                </li>
                <li></li>
              </ul>
            </section>
          }
          values={logFiles ?? []}
          className="mt-2 overflow-auto font-mono"
          style={{ maxHeight: 200 }}
        />
      </Modal>
    </div>
  )
}

DeploymentDetailsPopUp.displayName = 'PopUps.DeploymentDetailsPopUp'
