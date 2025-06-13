import React from 'react'
import clsx from 'clsx'
import { Table, TableProps } from '../Data/Table'
import { SortDirection } from '../Data/TableHeader'
import { capitalize } from '@mbari/utils'

export interface MissionTableProps {
  className?: string
  style?: React.CSSProperties
  missions: Mission[]
  selectedId?: string
  onSelectMission?: (missionId: string) => void
  onSortColumn?: (column: number, ascending?: boolean) => void
  sortColumn?: number | null
  sortDirection?: SortDirection
  loading?: boolean
}

export interface Mission {
  id: string
  category: string
  name: string
  note?: string
  description?: string
  vehicle?: string
  ranBy?: string
  ranOn?: string
  ranAt?: string
  waypointCount?: number
  parameterCount?: number
  recentRun?: boolean
  frequentRun?: boolean
}

export const MissionTable: React.FC<MissionTableProps> = ({
  className,
  style,
  missions,
  selectedId,
  onSelectMission,
  onSortColumn,
  sortColumn,
  sortDirection,
  loading,
}) => {
  const shouldShowVehicleColumn = missions.some((p) => p.recentRun)
  const missionRows = missions.map(
    ({
      category,
      name,
      note,
      description,
      ranBy,
      ranOn,
      ranAt,
      waypointCount,
      parameterCount,
      vehicle,
    }) => ({
      cells: [
        {
          label: category
            ? `${category}: ${name}`
            : `${name !== '' && name ? name : 'Unnamed mission'}`,
          secondary: note ? <span className="italic">{note}</span> : null,
          span: 2,
        },
        shouldShowVehicleColumn
          ? {
              label: capitalize(vehicle ?? 'Current Vehicle'),
            }
          : null,
        {
          label: description ? description : 'No description',
          span: 3,
          secondary: (
            <ul className="">
              <li className="flex">
                {ranBy && `Last ran by ${ranBy}`}
                {ranOn && ` on ${ranOn}`}
              </li>
              <li className="flex">{ranAt && `Location ran at: ${ranAt}`}</li>
              {waypointCount || parameterCount ? (
                <li className="flex">
                  {`This mission has${
                    waypointCount
                      ? ` ${waypointCount} waypoint override${
                          waypointCount !== 1 ? 's' : ''
                        }`
                      : ''
                  }${waypointCount && parameterCount ? ' and' : ''}${
                    parameterCount
                      ? ` ${parameterCount} parameter override${
                          parameterCount !== 1 ? 's' : ''
                        }`
                      : ''
                  }`}
                </li>
              ) : null}
            </ul>
          ),
        },
      ].filter((i) => i),
    })
  ) as TableProps['rows']

  const header = {
    cells: [
      {
        label: 'MISSION NAME',
        onSort: onSortColumn,
        span: 2,
      },
      shouldShowVehicleColumn
        ? {
            label: 'VEHICLE',
            onSort: onSortColumn,
          }
        : null,
      { label: 'DESCRIPTION', onSort: onSortColumn, span: 3 },
    ].filter((i) => i),
    activeSortColumn: sortColumn,
    activeSortDirection: sortDirection,
  } as TableProps['header']

  const handleSelect = (index: number) => {
    onSelectMission?.(missions[index].id)
  }

  return (
    <Table
      className={clsx('', className)}
      style={style}
      scrollable
      header={header}
      rows={missionRows}
      onSelectRow={onSelectMission && handleSelect}
      selectedIndex={
        selectedId ? missions.findIndex(({ id }) => id === selectedId) : null
      }
      colInRow={6}
      loading={loading}
    />
  )
}

MissionTable.displayName = 'Tables.MissionTable'
