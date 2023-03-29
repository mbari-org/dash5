import React, { useEffect, useState, useRef } from 'react'
import { SelectOption } from '../../Fields/Select'
import { SortDirection } from '../../Data/TableHeader'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { IconButton } from '../../Navigation'
import { Input, SelectField } from '../../Fields'
import { sortByProperty } from '@mbari/utils'

import {
  Command,
  CommandTable,
  CommandTableProps,
} from '../../Tables/CommandTable'

const filters: SelectOption[] = [
  { name: 'Templates', id: 'all' },
  { name: 'Recent', id: 'recent' },
  { name: 'Frequent', id: 'frequent' },
]

type CommandFilter = 'recent' | 'frequent' | 'all'

export interface SelectCommandStepProps extends CommandTableProps {
  onSelectCommandId?: (
    commandId?: CommandTableProps['selectedId'],
    commandName?: CommandTableProps['selectedId'],
    isTemplate?: boolean
  ) => void
  selectedCommandName?: CommandTableProps['selectedId']
  recentCommands?: Command[]
  frequentCommands?: Command[]
  vehicleName: string
  onMoreInfo?: () => void
}

export const SelectCommandStep: React.FC<SelectCommandStepProps> = ({
  selectedId,
  recentCommands,
  frequentCommands,
  commands,
  onSelectCommandId,
  vehicleName,
  selectedCommandName,
  onMoreInfo: handleMoreInfo,
}) => {
  const [selectedCommandId, setSelectedCommandId] =
    useState<SelectCommandStepProps['selectedId']>(selectedId)
  const [selectedFilter, setSelectedFilter] = useState<CommandFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(commands)
  const [sortColumn, setSortColumn] = useState<number | null | undefined>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSelectedCommandId = (
    commandId?: SelectCommandStepProps['selectedId']
  ) => {
    setSelectedCommandId(commandId)
  }

  const handleSelectFilter = (filter: string | null) => {
    if (filter) {
      handleSelectedCommandId()
      setSelectedFilter(filter as CommandFilter)
    }
    setSearchTerm('')
  }

  const handleSearch = (term: string) => {
    if (selectedFilter || selectedCommandId) {
      handleSelectedCommandId()
    }
    setSearchTerm(term)
  }

  const handleSort = (column: number, isAscending?: boolean) => {
    const sortableColumns: string[] = ['name', 'vehicle', 'description']
    const sortProperty = sortableColumns[column] as keyof Command
    const updatedIsAscending = !isAscending

    const sortedCommands = sortByProperty({
      arrOfObj: [...filteredCommands],
      sortProperty,
      secondarySort: 'name',
      sortAscending: updatedIsAscending,
    })
    setSortColumn(column)
    setSortDirection(updatedIsAscending ? 'asc' : 'desc')
    setFilteredCommands(sortedCommands as Command[])
  }

  useEffect(() => {
    if (selectedCommandId) {
      var commandName: string | undefined = selectedCommandId
      switch (selectedFilter) {
        case 'recent':
          commandName = recentCommands?.find(
            ({ id }) => id === selectedCommandId
          )?.name
          break
        case 'frequent':
          commandName = frequentCommands?.find(
            ({ id }) => id === selectedCommandId
          )?.name
          break
      }
      if (commandName !== selectedCommandName) {
        onSelectCommandId?.(
          selectedCommandId,
          commandName,
          !['recent', 'frequent'].includes(selectedFilter)
        )
      }
    }
  }, [
    selectedCommandId,
    selectedFilter,
    selectedCommandName,
    recentCommands,
    frequentCommands,
    onSelectCommandId,
  ])

  const lastSelectedFilter = useRef(selectedFilter)
  useEffect(() => {
    if (selectedFilter) {
      if (selectedFilter !== lastSelectedFilter.current) {
        lastSelectedFilter.current = selectedFilter
      }
      //setSearchTerm('')
      setSortDirection(null)
      switch (selectedFilter) {
        case 'recent':
          setFilteredCommands(recentCommands || [])
          break
        case 'frequent':
          setFilteredCommands(frequentCommands || [])
          break
        default:
          setFilteredCommands(commands)
          break
      }
    }

    if (searchTerm) {
      setSortDirection(null)
      const searchResults = filteredCommands.filter(({ name }) =>
        name.includes(searchTerm)
      )
      setFilteredCommands(searchResults)
    }

    if (!selectedFilter && !searchTerm) {
      setFilteredCommands(commands)
    }
  }, [searchTerm, selectedFilter, commands])

  return (
    <section className="h-full">
      <ul className="grid grid-cols-5 pb-2">
        <li className="col-span-2 self-center">
          Select a command for{' '}
          <span className="text-teal-500" data-testid="vehicle name">
            {vehicleName}
          </span>
          {handleMoreInfo && (
            <IconButton
              icon={faInfoCircle}
              ariaLabel="More info"
              onClick={handleMoreInfo}
            />
          )}
        </li>
        <li className="col-span-3 flex items-center">
          <SelectField
            name="Recent commands"
            placeholder="Recent Commands"
            options={filters}
            value={selectedFilter ?? undefined}
            onSelect={(id) => handleSelectFilter(id)}
          />
          <Input
            name="Search commands field"
            placeholder="Search commands"
            className="ml-2 h-full flex-grow"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </li>
      </ul>

      <CommandTable
        commands={filteredCommands}
        selectedId={selectedCommandId ? selectedCommandId : ''}
        onSelectCommand={handleSelectedCommandId}
        onSortColumn={handleSort}
        // calculated max height provides responsive table size without clipping inside modal
        className="max-h-[calc(100%-40px)]"
        activeSortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </section>
  )
}
