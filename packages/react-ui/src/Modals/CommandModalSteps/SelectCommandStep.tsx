import React, { useEffect, useState, useRef } from 'react'
import { SelectOption } from '../../Fields/Select'
import { SortDirection } from '../../Data/TableHeader'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
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
  showAdvanced?: boolean
  onToggleAdvanced?: () => void
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
  showAdvanced,
  onToggleAdvanced: handleToggleAdvanced,
}) => {
  const [selectedCommandId, setSelectedCommandId] =
    useState<SelectCommandStepProps['selectedId']>(selectedId)
  const [selectedFilter, setSelectedFilter] = useState<CommandFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const sortedCommands = React.useMemo(
    () => [...commands].sort((a, b) => a.name.localeCompare(b.name)),
    [commands]
  )

  const [filteredCommands, setFilteredCommands] =
    useState<Command[]>(sortedCommands)
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

  // Commands that are marked advanced in the API but should always appear in the standard list
  const ALWAYS_SHOW_IN_STANDARD = new Set(['quit', 'strobe'])

  const standardCommands = React.useMemo(
    () =>
      commands.filter((c) => !c.advanced || ALWAYS_SHOW_IN_STANDARD.has(c.id)),
    [commands]
  )

  const lastSelectedFilter = useRef(selectedFilter)
  useEffect(() => {
    if (selectedFilter) {
      if (selectedFilter !== lastSelectedFilter.current) {
        lastSelectedFilter.current = selectedFilter
      }
      setSortDirection(null)
      switch (selectedFilter) {
        case 'recent':
          setFilteredCommands(recentCommands || [])
          break
        case 'frequent':
          setFilteredCommands(frequentCommands || [])
          break
        default:
          setFilteredCommands(sortedCommands)
          break
      }
    }

    if (searchTerm) {
      // Search always runs against all commands regardless of the standard-only toggle
      setSortDirection(null)
      const searchResults = sortedCommands.filter(({ name }) =>
        name.includes(searchTerm)
      )
      setFilteredCommands(searchResults)
    }

    if (!selectedFilter && !searchTerm) {
      setFilteredCommands(sortedCommands)
    }
  }, [searchTerm, selectedFilter, sortedCommands])

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
        <li className="col-span-3 flex items-center gap-2">
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
            className="h-full flex-grow"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {handleToggleAdvanced && (
            <label className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 text-xs text-gray-500 select-none">
              <input
                type="checkbox"
                checked={!(showAdvanced ?? true)}
                onChange={handleToggleAdvanced}
                className="h-3.5 w-3.5 accent-blue-600"
              />
              Standard only
            </label>
          )}
        </li>
      </ul>

      <CommandTable
        commands={
          !searchTerm && !(showAdvanced ?? true)
            ? filteredCommands.filter(
                (c) => !c.advanced || ALWAYS_SHOW_IN_STANDARD.has(c.id)
              )
            : filteredCommands
        }
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
