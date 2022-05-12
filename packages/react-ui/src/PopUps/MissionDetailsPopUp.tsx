import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faCheck } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { InProgressIcon } from '../Icons/InProgressIcon'
import { ShoreToShipIcon } from '../Icons/ShoreToShipIcon'
import { Table } from '../Data/Table'
import { Modal } from '../Modal'

export interface MissionDetailsPopUpProps {
  className?: string
  style?: React.CSSProperties
  overrides: OverrideSection[]
  missionDetails: MissionDetail[]
  startTime?: string
  endTime?: string
  completeTime?: string
  missionId: number
  missionStatus: MissionStatus
  missionName: string
  commandName: string
  queue?: string
  transmission?: string
  acknowledge?: string
  vehicle?: string
  onLog: (missionId: number) => void
}

export type MissionStatus = 'waiting' | 'in progress' | 'completed'

export type CellValue = string | JSX.Element

export interface MissionDetail {
  name: CellValue
  value: CellValue
}

export interface OverrideSection {
  headerLabel: CellValue
  values: MissionDetail[]
}

const styles = {
  grayText: 'opacity-60',
  highlightedText: 'text-teal-600',
  header: 'flex pb-1',
  tableSection: 'w-full bg-white pt-2',
  statusDisplay: 'flex flex-col items-center justify-center',
  commandDetails: 'flex py-4',
  list: 'flex flex-col',
  logButton: 'text-left text-purple-600',
}

export const MissionDetailsPopUp: React.FC<MissionDetailsPopUpProps> = ({
  className,
  style,
  overrides,
  missionDetails,
  startTime,
  endTime,
  completeTime,
  missionId,
  missionStatus,
  missionName,
  commandName,
  queue,
  transmission,
  acknowledge,
  vehicle,
  onLog,
}) => {
  const statusDisplay = () => {
    switch (missionStatus) {
      case 'waiting':
        return (
          <>
            <FontAwesomeIcon
              icon={faBuilding as IconProp}
              className="text-3xl"
            />
            <div>Waiting to</div>
            <div>transmit</div>
          </>
        )
      case 'in progress':
        return (
          <>
            <InProgressIcon />
            <div>In progress</div>
          </>
        )
      case 'completed':
        return (
          <>
            <FontAwesomeIcon icon={faCheck as IconProp} className="text-3xl" />
            <div>Completed</div>
          </>
        )
      default:
        return <></>
    }
  }

  return (
    <Modal
      onClose={() => {
        console.log('close')
      }}
      grayHeader={true}
      title={
        <div className={styles.header}>
          <ul className={clsx('flex-grow', styles.list)}>
            <li>
              <span className="font-medium">{missionName}</span>
              <span className={clsx('ml-1 italic', styles.grayText)}>
                {commandName}
              </span>
            </li>
            {startTime && (
              <li className={styles.grayText}>
                <span className="mr-1">
                  {missionStatus === 'waiting' ? 'Est. Start:' : 'Start Time:'}
                </span>
                <span>{startTime}</span>
              </li>
            )}
            {endTime && (
              <li className={styles.grayText}>
                Est. End: <span>{endTime}</span>
              </li>
            )}
            {completeTime && (
              <li className={styles.grayText}>
                Completed: <span>{completeTime}</span>
              </li>
            )}
            <li>
              <button
                className={styles.logButton}
                onClick={swallow(() => onLog(missionId))}
              >
                view in log
              </button>
            </li>
          </ul>
          <div className={styles.statusDisplay}>{statusDisplay()}</div>
        </div>
      }
      open={true}
      className={clsx('', className)}
      style={style}
    >
      <section className={styles.commandDetails}>
        <ShoreToShipIcon
          className="fill-transparent stroke-stone-600"
          waiting={missionStatus === 'waiting'}
        />
        <ul className={clsx('ml-4', styles.list, styles.grayText)}>
          <li className="py-1">
            <span className="font-medium">Added to queue: </span>
            <span>{queue}</span>
          </li>
          {missionStatus === 'waiting' ? (
            <li className="py-1 font-medium">Waiting to transmit...</li>
          ) : (
            transmission && (
              <li className="py-1">
                <span className="font-medium">Transmission by sat: </span>
                <span>{transmission}</span>
              </li>
            )
          )}
          {acknowledge && vehicle && (
            <li className="py-1">
              <span className="font-medium">Acknowledged by {vehicle}: </span>
              <span>{acknowledge}</span>
            </li>
          )}
        </ul>
      </section>

      <section className={styles.tableSection}>
        <Table
          header={{
            labels: [
              `${missionStatus === 'completed' ? 'SUMMARY' : 'ESTIMATES'}`,
            ],
          }}
          rows={missionDetails.map(({ name, value }) => ({
            values: [name, value],
          }))}
        />
      </section>

      <section className={styles.tableSection}>
        {overrides.map(({ headerLabel, values }, index) => (
          <Table
            key={`${headerLabel}${index}`}
            className={clsx('flex-grow', styles.list)}
            highlightedStyle={styles.highlightedText}
            header={{ labels: [`${headerLabel} (${values.length})`, 'VALUES'] }}
            rows={values.map(({ name, value }) => ({
              values: [name, value],
              highlighted: true,
            }))}
          />
        ))}
      </section>
    </Modal>
  )
}

MissionDetailsPopUp.displayName = 'PopUps.MissionDetailsPopUp'
