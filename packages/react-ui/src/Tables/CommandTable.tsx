import clsx from 'clsx'
import React from 'react'
import { Table } from '../Data/Table'
import { SortDirection } from '../Data/TableHeader'

export interface CommandTableProps {
  className?: string
  style?: React.CSSProperties
  commands: Command[]
  selectedId?: string
  onSelectCommand?: (commandId: string) => void
  onSortColumn?: (column: number, ascending?: boolean) => void
  activeSortColumn?: number | null
  sortDirection?: SortDirection
}

export interface Command {
  id: string
  name: string
  description?: string
  vehicle?: string
}

export const CommandTable: React.FC<CommandTableProps> = ({
  className,
  style,
  commands,
  selectedId,
  onSelectCommand,
  onSortColumn,
  activeSortColumn,
  sortDirection,
}) => {
  const commandRows = commands.map(({ name, description }) => ({
    cells: [
      {
        label: name,
        highlighted: true,
        highlightedStyle: 'opacity-80',
        span: 2,
      },
      {
        label: description ?? 'No description available',
        highlighted: true,
        highlightedStyle: 'opacity-60',
        span: 2,
      },
    ],
  }))

  const header = {
    cells: [
      {
        label: 'COMMAND',
        onSort: onSortColumn,
        span: 2,
      },
      { label: 'DESCRIPTION', span: 2, onSort: onSortColumn },
    ],
    activeSortColumn,
    activeSortDirection: sortDirection,
  }

  const handleSelect = (index: number) => {
    onSelectCommand?.(commands[index].id)
  }
  return (
    <Table
      className={clsx(className, '')}
      style={style}
      grayHeader
      scrollable
      header={header}
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
