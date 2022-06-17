import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'

export interface MissionTableProps {
  className?: string
  style?: React.CSSProperties
  missions: Mission[]
  selectedId?: string
  onSelectMission?: (missionId: string) => void
  onSortColumn?: (column: string, ascending?: boolean) => void
}

export interface Mission {
  id: string
  category: string
  name: string
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
}) => {
  const missionRows = missions.map(
    ({
      category,
      name,
      description,
      vehicle,
      ranBy,
      ranOn,
      ranAt,
      waypointCount,
    }) => ({
      cells: [
        { label: category, secondary: name },
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

  const handleSelect = (index: number) => {
    onSelectMission?.(missions[index].id)
  }

  return (
    <div className={clsx('', className)} style={style}>
      <Table
        scrollable
        header={{
          cells: [
            {
              label: 'MISSION NAME',
              onSort: onSortColumn,
            },
            {
              label: 'ALL LRAUV',
              onSort: onSortColumn,
              sortDirection: 'desc',
            },
            { label: 'DESCRIPTION' },
          ],
        }}
        rows={missionRows}
        onSelectRow={onSelectMission && handleSelect}
        selectedIndex={
          selectedId ? missions.findIndex(({ id }) => id === selectedId) : null
        }
      />
    </div>
  )
}

MissionTable.displayName = 'Tables.MissionTable'
