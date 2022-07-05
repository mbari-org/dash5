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
import { swallow } from '@mbari/utils'
import { IconButton } from '../Navigation'
import { DateTime } from 'luxon'
import { DateField, SelectField } from '../Fields'
import { SelectOption } from '../Fields/Select'

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

const styles = {
  markTimeButton: 'rounded border-2 border-stone-400/60 py-1 px-2 text-sm',
  gitTag: 'my-4 flex items-center font-thin opacity-60',
  headerIcon: 'flex flex-col items-center justify-center opacity-40',
  timezoneSelector: 'flex w-full justify-end text-indigo-600',
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
  const [editDates, setEditDates] = useState(false)
  const [editTags, setEditTags] = useState(false)
  const [isUTC, setIsUTC] = useState(true)

  const dateCell = (type: eventType) => {
    const deployKey = `${type}Date`

    if (editDates) {
      return {
        label: (
          <DateField
            name={deployKey}
            timeZone={isUTC ? 'UTC' : undefined}
            className="text-sm"
            value={deployment[deployKey as keyof DeploymentDetails]}
            onChange={(newValue: string) =>
              setDeployment({
                ...deployment,
                [deployKey as keyof DeploymentDetails]: newValue,
              })
            }
          />
        ),
        highlighted: true,
        span: 3,
      }
    }
    const deployLabel = deployment[deployKey as keyof DeploymentDetails] || ''
    return deployLabel
      ? {
          label: isUTC
            ? DateTime.fromJSDate(new Date(deployLabel))
                .toUTC()
                .toLocaleString(DateTime.DATETIME_FULL)
            : DateTime.fromJSDate(new Date(deployLabel)).toLocaleString(
                DateTime.DATETIME_FULL
              ),
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

  const handleConfirm = () => {
    setEditDates(false)
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
    setEditTags(false)
  }

  return (
    <div className={clsx('', className)} style={style}>
      <Modal
        onConfirm={editDates ? handleConfirm : null}
        onCancel={editDates ? () => setEditDates(false) : null}
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
                  {editTags ? (
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
                  onClick={() => setEditTags(true)}
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
                          !isUTC && styles.selectedTimezone
                        )}
                        onClick={() => setIsUTC(false)}
                      >
                        Local time
                      </button>{' '}
                      /{' '}
                      <button
                        aria-label="UTC time button"
                        className={clsx(
                          'ml-1',
                          isUTC && styles.selectedTimezone
                        )}
                        onClick={() => setIsUTC(true)}
                      >
                        UTC
                      </button>
                    </li>
                    {!editDates && (
                      <li className="ml-4">
                        <IconButton
                          icon={faPen}
                          ariaLabel="edit dates button"
                          onClick={() => setEditDates(true)}
                        />
                      </li>
                    )}
                  </ul>
                ),
                span: 5,
              },
            ],
          }}
          rows={[
            {
              cells: [
                {
                  label: <span>Start</span>,
                  icon: <StartIcon />,
                  span: 2,
                  fixedIconWidth: true,
                },
                dateCell('start'),
              ],
            },
            {
              cells: [
                {
                  label: <span>Launch</span>,
                  secondary: <span className="text-xs">Vehicle in water</span>,
                  icon: <UnderwaterIcon />,
                  span: 2,
                  fixedIconWidth: true,
                },
                dateCell('launch'),
              ],
            },
            {
              cells: [
                {
                  label: <span>Recovery</span>,
                  secondary: <span className="text-xs">Vehicle recovered</span>,
                  icon: <RecoveredIcon />,
                  span: 2,
                  fixedIconWidth: true,
                },
                dateCell('recovery'),
              ],
            },
            {
              cells: [
                {
                  label: <span>End</span>,
                  icon: <EndIcon />,
                  span: 2,
                  fixedIconWidth: true,
                },
                dateCell('end'),
              ],
            },
          ]}
        />
        <SummaryList
          header={
            <section>
              <ul>
                <li>
                  <div className="mb-1 flex w-full justify-between">
                    <span className="font-display">
                      DIRECTORY LIST ({logFiles?.length ?? 0} LOG FILES)
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
