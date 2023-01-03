import React, { useEffect, useState } from 'react'
import { SelectOption } from '../../Fields/Select'
import { Mission, MissionTable } from '../../Tables/MissionTable'
import { Input, SelectField } from '../../Fields'
import { sortByProperty } from '@mbari/utils'
import { SortDirection } from 'react-ui/src/Data/TableHeader'

export interface MissionStepProps {
  vehicleName: string
  missions: Mission[]
  selectedId?: string | null
  onSelect: (id?: string | null) => void
  missionCategories?: SelectOption[]
  selectedCategory?: string
  onSelectCategory?: (id?: string) => void
}

export const MissionStep: React.FC<MissionStepProps> = ({
  vehicleName,
  missions,
  selectedId,
  onSelect,
  missionCategories,
  onSelectCategory: handleSelectCategory,
  selectedCategory = 'Recent Runs',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMissions, setFilteredMissions] = useState<Mission[]>(missions)
  const [searchMissions, setSearchMissions] = useState<Mission[]>([])
  const [sortColumn, setSortColumn] = useState<number | null | undefined>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  useEffect(() => {
    const filteredByRecent = missions.filter(({ category, recentRun }) => {
      if (selectedCategory?.match(/recent runs/i)) return recentRun
      if (selectedCategory?.match(/default/i))
        return category.length < 1 && !recentRun
      return category.includes(selectedCategory ?? '') && !recentRun
    })

    setFilteredMissions(filteredByRecent.length ? filteredByRecent : [])
  }, [selectedCategory, missionCategories, missions])

  useEffect(() => {
    if (searchTerm) {
      const lowerCaseTerm = searchTerm.toLowerCase()
      const searchResults = filteredMissions.filter((mission) =>
        Object.values(mission).join(' ').toLowerCase().includes(lowerCaseTerm)
      )
      setSearchMissions(searchResults)
    }

    if (!searchTerm) setSearchMissions([])
  }, [searchTerm, filteredMissions])

  const handleSelectCategoryId = (id: string | null) => {
    if (!id) {
      onSelect(null)
    } else {
      setSearchTerm('')
      handleSelectCategory?.(id)
    }
  }

  const handleSearch = (term: string) => {
    if (selectedId) {
      onSelect(null)
    }
    setSearchTerm(term)
  }

  const handleSort = (column: number, isAscending?: boolean) => {
    const sortableColumns: string[] = ['category', 'vehicle', 'description']
    const sortProperty = sortableColumns[column] as keyof Mission
    const updatedIsAscending = !isAscending

    const sortedMissions = sortByProperty({
      arrOfObj: [...filteredMissions],
      sortProperty: sortProperty === 'category' ? 'id' : sortProperty,
      secondarySort: 'category',
      sortAscending: updatedIsAscending,
    })
    setSortColumn(column)
    setSortDirection(updatedIsAscending ? 'asc' : 'desc')
    setFilteredMissions(sortedMissions as Mission[])
  }

  return (
    <article className="h-full">
      <ul className="grid grid-cols-5 pb-2">
        <li className="col-span-2 self-center">
          Select a command for{' '}
          <span className="text-teal-500" data-testid="vehicle name">
            {vehicleName}
          </span>
        </li>
        <li className="col-span-3 flex items-center">
          <SelectField
            name="Recent runs"
            placeholder="Recent Runs"
            options={missionCategories}
            value={selectedCategory ? selectedCategory : undefined}
            onSelect={handleSelectCategoryId}
            className="flex-grow"
          />
          <Input
            name="Search missions field"
            placeholder="Search Missions"
            className="ml-2 h-full flex-grow"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </li>
      </ul>
      <MissionTable
        className="max-h-[calc(100%-40px)]"
        missions={searchMissions.length ? searchMissions : filteredMissions}
        selectedId={selectedId ? selectedId : ''}
        onSelectMission={onSelect}
        onSortColumn={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </article>
  )
}
