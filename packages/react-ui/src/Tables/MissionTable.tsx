import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { SortDirection } from '../Data/TableHeader'

export interface MissionTableProps {
  className?: string
  style?: React.CSSProperties
  missions: Mission[]
  selectedId?: string
  onSelectMission?: (missionId: string) => void
  onSortColumn?: (column: number, ascending?: boolean) => void
  sortColumn?: number | null
  sortDirection?: SortDirection
}

export interface Mission {
  id: string
  category: string
  name: string
  task: string
  description?: string
  vehicle: string
  ranBy: string
  ranOn: string
  ranAt?: string
  waypointCount?: number
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
}) => {
  const missionRows = missions.map(
    ({
      category,
      name,
      task,
      description,
      vehicle,
      ranBy,
      ranOn,
      ranAt,
      waypointCount,
    }) => ({
      cells: [
        { label: `${category}: ${name}`, secondary: task },
        { label: vehicle },
        {
          label: description ? description : 'No description',
          secondary: `Run by ${ranBy} on ${ranOn} ${
            waypointCount ? `with ${waypointCount} waypoints` : ''
          }${waypointCount && ranAt ? ' ' : ''}${ranAt ? `at ${ranAt}` : ''}`,
        },
      ],
    })
  )

  const header = {
    cells: [
      {
        label: 'MISSION NAME',
        onSort: onSortColumn,
      },
      {
        label: 'ALL LRAUV',
        onSort: onSortColumn,
      },
      { label: 'DESCRIPTION', onSort: onSortColumn },
    ],
    activeSortColumn: sortColumn,
    activeSortDirection: sortDirection,
  }

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
    />
  )
}

MissionTable.displayName = 'Tables.MissionTable'
