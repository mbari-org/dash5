import React, { useState } from 'react'
import clsx from 'clsx'
import { Modal } from '../Modal'
import { UnderwaterIcon } from '../Icons/UnderwaterIcon'
import { RecoveredIcon } from '../Icons/RecoveredIcon'
import { Table } from '../Data/Table'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpandArrows, faPen } from '@fortawesome/pro-regular-svg-icons'
import { StartIcon } from '../Icons/StartIcon'
import { EndIcon } from '../Icons/EndIcon'
import { SummaryList } from '../Data/SummaryList'
import { capitalize, capitalizeSnakeCase, swallow } from '@mbari/utils'
import { IconButton } from '../Navigation'
import { DateTime } from 'luxon'
import { DateField, SelectField } from '../Fields'
import { SelectOption } from '../Fields/Select'
import { luxonValidTimezones } from '../Forms/NewDeploymentForm'

interface DeploymentDetails {
  name: string
  gitTag?: string
  startDate?: string
  launchDate?: string
  recoveryDate?: string
  endDate?: string
}

export interface DeploymentDetailsPopUpProps extends DeploymentDetails {
  className?: string
  style?: React.CSSProperties
  complete?: boolean
  queueSize: number
  tagOptions?: SelectOption[]
  logFiles?: string[]
  directoryListFilepath?: string
  onExpand?: () => void
  onSaveChanges: (details: DeploymentDetails) => void
  onSetDeploymentEventToCurrentTime: (event: eventType) => void
}

type eventType = 'start' | 'launch' | 'recovery' | 'end'

interface eventCell {
  label: eventType
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
  recoveryDate,
  endDate,
  onExpand,
  onSaveChanges,
  onSetDeploymentEventToCurrentTime,
}) => {
  const initialDeploymentValues = {
    name: name,
    gitTag: gitTag || '',
    startDate: startDate || '',
    launchDate: launchDate || '',
    recoveryDate: recoveryDate || '',
    endDate: endDate || '',
  }

  const [deployment, setDeployment] = useState<DeploymentDetails>(
    initialDeploymentValues
  )
  const [isSelectDatesMode, setIsSelectDatesMode] = useState(false)
  const [isSelectTagsMode, setIsSelectTagsMode] = useState(false)
  const [isSelectTimezoneMode, setIsSelectTimezoneMode] = useState(false)
  const [isLocal, setIsLocal] = useState(true)
  const [timezone, setTimezone] = useState<string | null>('')

  const dateCell = (type: eventType) => {
    const eventDateLabel = `${type}Date`

    if (isSelectDatesMode) {
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
          />
        ),
        highlighted: true,
        span: 3,
      }
    }
    const eventDate =
      deployment[eventDateLabel as keyof DeploymentDetails] || ''

    return eventDate
      ? {
          label:
            isLocal || !timezone
              ? DateTime.fromJSDate(new Date(eventDate)).toLocaleString(
                  DateTime.DATETIME_FULL
                )
              : DateTime.fromJSDate(new Date(eventDate))
                  .setZone(timezone ?? undefined)
                  .toLocaleString(DateTime.DATETIME_FULL),
          span: 3,
        }
      : {
          label: (
            <button
              className={styles.markTimeButton}
              onClick={swallow(() => onSetDeploymentEventToCurrentTime(type))}
              aria-label={`mark ${type} time now button`}
            >
              Mark {type} time now
            </button>
          ),
          highlighted: true,
          span: 3,
        }
  }

  const eventCell = ({ label, icon, secondary }: eventCell) => ({
    label: <span>{capitalize(label)}</span>,
    secondary: secondary ? (
      <span className="text-xs">{secondary}</span>
    ) : undefined,
    icon: icon,
    span: 2,
    fixedIconWidth: true,
  })

  const tableRows = (rows: eventCell[]) => {
    return rows.map(({ label, icon, secondary }) => ({
      cells: [eventCell({ label, icon, secondary }), dateCell(label)],
    }))
  }

  const handleConfirm = () => {
    setIsSelectDatesMode(false)

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
    const updatedTagDeployment = {
      ...deployment,
      gitTag: newValue ?? undefined,
    }
    setDeployment(updatedTagDeployment)
    onSaveChanges(updatedTagDeployment)
    setIsSelectTagsMode(false)
  }

  const handleCancel = () => {
    setIsSelectDatesMode(false)
    setDeployment({ ...initialDeploymentValues, gitTag: deployment.gitTag })
  }

  return (
    <div className={clsx('', className)} style={style}>
      <Modal
        onConfirm={isSelectDatesMode ? handleConfirm : null}
        onCancel={isSelectDatesMode ? handleCancel : null}
        confirmButtonText="Save Changes"
        onClose={() => console.log('something')}
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
                  {isSelectTagsMode ? (
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
                  onClick={() => setIsSelectTagsMode(true)}
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
        open
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
                    {!isSelectDatesMode && (
                      <li className="ml-4">
                        <IconButton
                          icon={faPen}
                          ariaLabel="edit dates button"
                          onClick={() => setIsSelectDatesMode(true)}
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
              label: 'recovery',
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
                            icon={faExpandArrows}
                            title="expand icon"
                          />
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="max-w-full text-xs">
                    {directoryListFilepath}
                  </div>
                </li>
                <li></li>
              </ul>
            </section>
          }
          values={logFiles ?? []}
          className="mt-2 font-mono"
        />
      </Modal>
    </div>
  )
}

DeploymentDetailsPopUp.displayName = 'PopUps.DeploymentDetailsPopUp'
