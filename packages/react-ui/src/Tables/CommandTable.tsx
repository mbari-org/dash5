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
  description: string
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
      { label: name, highlighted: true, highlightedStyle: 'opacity-80' },
      {
        label: vehicle,
        highlighted: true,
        highlightedStyle: 'opacity-60',
      },
      {
        label: description ? description : 'No description',
        highlighted: true,
        highlightedStyle: 'opacity-60',
      },
    ],
  }))

  const handleSelect = (index: number) => {
    onSelectCommand?.(commands[index].id)
  }
  return (
    <Table
      className={className}
      style={style}
      grayHeader
      scrollable
      header={{
        cells: [
          {
            label: 'COMMAND',
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
      rows={commandRows}
      onSelectRow={onSelectCommand && handleSelect}
      selectedIndex={
        selectedId ? commands.findIndex(({ id }) => id === selectedId) : null
      }
    />
  )
}

CommandTable.displayName = 'Tables.CommandTable'
