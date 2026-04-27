import React, { useState, useMemo, useEffect } from 'react'
import { SelectOption } from '../../Fields/Select'
import { Mission, MissionTable } from '../../Tables/MissionTable'
import { Input, SelectField } from '../../Fields'
import { sortByProperty } from '@mbari/utils'
import { SortDirection } from '../../Data/TableHeader'

export interface MissionStepProps {
  vehicleName: string
  missions: Mission[]
  selectedId?: string | null
  onSelect: (id?: string | null) => void
  missionCategories?: SelectOption[]
  selectedCategory?: string
  onSelectCategory?: (id?: string) => void
  showAllVehicleMissions?: boolean
  onShowAllVehicleMissions?: (show: boolean) => void
  defaultSearchText?: string
  loading?: boolean
}

export const MissionStep: React.FC<MissionStepProps> = ({
  vehicleName,
  missions,
  selectedId,
  onSelect,
  missionCategories,
  onSelectCategory: handleSelectCategory,
  selectedCategory = 'Recent Runs',
  showAllVehicleMissions = false,
  onShowAllVehicleMissions: handleShowAllVehicleMissions,
  defaultSearchText = '',
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultSearchText)
  const [sortColumn, setSortColumn] = useState<number | null | undefined>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const runsCategory =
    selectedCategory?.match(/recent runs/i) ||
    selectedCategory?.match(/frequent runs/i)

  // Reset filters when the category changes
  useEffect(() => {
    setSearchTerm('')
    setSortColumn(null)
    setSortDirection(null)
  }, [selectedCategory])

  // Filter missions by category
  const filteredMissions = useMemo(() => {
    return missions.filter(({ category, recentRun, frequentRun }) => {
      if (selectedCategory?.match(/recent runs/i)) return recentRun
      if (selectedCategory?.match(/frequent runs/i)) return frequentRun
      if (selectedCategory?.match(/default/i))
        return category.length < 1 && !recentRun
      return (
        category.includes(selectedCategory ?? '') && !recentRun && !frequentRun
      )
    })
  }, [missions, selectedCategory])

  // Sort missions based on sort column and direction state if present
  const sortedMissions = useMemo(() => {
    if (!sortColumn) return filteredMissions

    const sortableColumns: (keyof Mission)[] = [
      'category',
      'vehicle',
      'description',
    ]

    const sortProperty =
      sortableColumns[sortColumn] === 'category'
        ? ('id' as keyof Mission)
        : sortableColumns[sortColumn]

    return sortByProperty({
      arrOfObj: [...filteredMissions],
      sortProperty,
      secondarySort: 'category',
      sortAscending: sortDirection === 'asc',
    }) as Mission[]
  }, [filteredMissions, sortColumn, sortDirection])

  // If it's a recent run, include pilot name in the searchable text, otherwise include mission description for other categroies (mission description for recent runs is the parameters, which should not be included)
  const searchableMissionTextMap = useMemo(() => {
    const map = new Map<string, string>()
    sortedMissions?.forEach((mission) => {
      let text = `${mission?.id ?? ''} ${mission?.note ?? ''}`.toLowerCase()
      selectedCategory?.match(/recent runs/i)
        ? (text += mission?.ranBy?.toLowerCase() ?? '')
        : (text += mission?.description?.toLowerCase() ?? '')
      if (mission?.id) map.set(mission.id, text)
    })
    return map
  }, [sortedMissions, selectedCategory])

  // Apply search term to the sorted list if present
  const searchedMissions = useMemo(() => {
    if (!searchTerm) return sortedMissions ?? []
    const lowerCaseTerm = searchTerm.toLowerCase()
    return sortedMissions.filter((mission) =>
      (searchableMissionTextMap?.get(mission.id) ?? '').includes(lowerCaseTerm)
    )
  }, [searchTerm, sortedMissions, searchableMissionTextMap])

  const handleSelectCategoryId = (id: string | null) => {
    if (!id) {
      onSelect(null)
    } else {
      setSearchTerm('')
      handleSelectCategory?.(id)
    }
  }

  const handleSearch = (term: string) => {
    // deselect any selected mission when searching so it doesn't stay selected when not visible due to search
    if (selectedId) {
      onSelect(null)
    }
    setSearchTerm(term)
  }

  const handleSort = (column: number, isAscending?: boolean) => {
    setSortColumn(column)
    setSortDirection(!isAscending ? 'asc' : 'desc')
  }

  return (
    <article className="h-full">
      <ul className="grid grid-cols-5 pb-2">
        <li className="col-span-2 flex flex-col items-start">
          <div>
            {' '}
            Select a command for{' '}
            <span className="text-teal-500" data-testid="vehicle name">
              {vehicleName}
            </span>
          </div>
          <label
            htmlFor="showAllVehicleMissions"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center text-sm ${
              runsCategory ? 'cursor-pointer' : 'opacity-40'
            }`}
          >
            <input
              id="showAllVehicleMissions"
              name="showAllVehicleMissions"
              type="checkbox"
              className="mr-1 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
              checked={showAllVehicleMissions}
              disabled={!runsCategory}
              onChange={(e) => {
                e.stopPropagation()
                handleShowAllVehicleMissions?.(e.target.checked)
              }}
            />
            Show runs for all vehicles
          </label>
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
        missions={searchedMissions}
        selectedId={selectedId ? selectedId : ''}
        onSelectMission={onSelect}
        onSortColumn={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        loading={loading}
      />
    </article>
  )
}
