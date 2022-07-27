import clsx from 'clsx'
import React from 'react'
import { Table } from '../Data/Table'

export interface CommandTableProps {
  className?: string
  style?: React.CSSProperties
  commands: Command[]
  selectedId?: string
  onSelectCommand?: (commandId: string) => void
  onSortColumn?: (column: string, ascending?: boolean) => void
}

export interface Command {
  id: string
  name: string
  description?: string
  vehicle: string
}

export const CommandTable: React.FC<CommandTableProps> = ({
  className,
  style,
  commands,
  selectedId,
  onSelectCommand,
  onSortColumn,
}) => {
  const commandRows = commands.map(({ name, vehicle, description }) => ({
    cells: [
      {
        label: name,
        highlighted: true,
        highlightedStyle: 'opacity-80',
        span: 2,
      },
      {
        label: vehicle,
        highlighted: true,
        highlightedStyle: 'opacity-60',
      },
      {
        label: description ? description : 'No description',
        highlighted: true,
        highlightedStyle: 'opacity-60',
        span: 2,
      },
    ],
  }))

  const handleSelect = (index: number) => {
    onSelectCommand?.(commands[index].id)
  }
  return (
    <Table
      className={clsx(className, '')}
      style={style}
      grayHeader
      scrollable
      header={{
        cells: [
          {
            label: 'COMMAND',
            onSort: onSortColumn,
            span: 2,
          },
          {
            label: 'ALL LRAUV',
            onSort: onSortColumn,
            sortDirection: 'desc',
          },
          { label: 'DESCRIPTION', span: 2 },
        ],
      }}
      rows={commandRows}
      onSelectRow={onSelectCommand && handleSelect}
      selectedIndex={
        selectedId ? commands.findIndex(({ id }) => id === selectedId) : null
      }
      colInRow={5}
    />
  )
}

CommandTable.displayName = 'Tables.CommandTable'
