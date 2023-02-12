import React, { useEffect, useState } from 'react'
import { SelectOption } from '../../Fields/Select'
import { Input, SelectField } from '../../Fields'
import {
  ParameterTable,
  ParameterProps,
  ParameterTableProps,
} from '../../Tables/ParameterTable'
import { StatDisplay, StatProps } from './StatDisplay'

export interface SafetyCommsProps extends StatProps {
  vehicleName: string
  mission: string
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  onSafetyUpdate: (
    name: string,
    newOverrideValue: string,
    newOverrideUnit: string
  ) => void
  onCommsUpdate: (
    name: string,
    newOverrideValue: string,
    newOverrideUnit: string
  ) => void
  onVerifyValue?: (param: string) => string
  unitOptions?: ParameterTableProps['unitOptions']
}

export const SafetyCommsStep: React.FC<SafetyCommsProps> = ({
  vehicleName,
  mission,
  safetyParams,
  commsParams,
  totalDistance,
  bottomDepth,
  duration,
  onVerifyValue,
  onSafetyUpdate,
  onCommsUpdate,
  unitOptions,
}) => {
  const [initialSafetyParams, setInitialSafetyParams] = useState(safetyParams)
  const [initialCommsParams, setInitialCommsParams] = useState(commsParams)
  const [searchTerm, setSearchTerm] = useState('')

  const [filteredSafetyParams, setFilteredSafetyParams] =
    useState<ParameterProps[]>(safetyParams)
  const [filteredCommsParams, setFilteredCommsParams] =
    useState<ParameterProps[]>(commsParams)
  const [sortBy, setSortBy] = useState('Order of Appearance')

  const sortOptions: SelectOption[] = [
    { id: 'Order of Appearance', name: 'Order of Appearance' },
    { id: 'Contains Overrides', name: 'Contains Overrides' },
    { id: 'No Overrides', name: 'No Overrides' },
  ]

  useEffect(() => {
    if (initialSafetyParams !== safetyParams) {
      setInitialSafetyParams(safetyParams)
      const updatedSafetyParams =
        [...filteredSafetyParams].map((param) =>
          safetyParams.find(({ name }) => name === param.name)
        ) ?? []
      setFilteredSafetyParams(updatedSafetyParams as ParameterProps[])
    }
    if (initialCommsParams !== commsParams) {
      setInitialCommsParams(commsParams)
      const updatedCommsParams =
        [...filteredCommsParams].map((param) =>
          commsParams.find(({ name }) => name === param.name)
        ) ?? []
      setFilteredCommsParams(updatedCommsParams as ParameterProps[])
    }
  }, [
    filteredSafetyParams,
    initialSafetyParams,
    safetyParams,
    filteredCommsParams,
    initialCommsParams,
    commsParams,
  ])

  const handleSelect = (id: string | null) => {
    id && setSortBy(id)
    id && handleSort([...filteredSafetyParams], id, 'safety')
    id && handleSort([...filteredCommsParams], id, 'comms')
  }

  const handleSort = (
    arr: ParameterProps[],
    sortType: string,
    paramType: 'safety' | 'comms'
  ) => {
    const overrideSort = [...arr].sort(
      (a, b) => (b?.overrideValue ? 1 : 0) - (a?.overrideValue ? 1 : 0)
    )
    const noOverrideSort = [...arr].sort(
      (a, b) => (a?.overrideValue ? 1 : 0) - (b?.overrideValue ? 1 : 0)
    )
    const originalParams = paramType === 'safety' ? safetyParams : commsParams
    const setCorrectParams =
      paramType === 'safety' ? setFilteredSafetyParams : setFilteredCommsParams

    const originalOrder = originalParams.filter((param) => arr.includes(param))

    switch (sortType) {
      case 'Contains Overrides':
        setCorrectParams(overrideSort)
        return
      case 'No Overrides':
        setCorrectParams(noOverrideSort)
        return
      default:
        setCorrectParams(originalOrder)
        return
    }
  }

  const handleSearch = (term: string) => {
    if (term) {
      const lowerCaseTerm = term.toLowerCase()
      const safetySearchResults = safetyParams.filter((param) =>
        Object.values(param).join(' ').toLowerCase().includes(lowerCaseTerm)
      )
      const commsSearchResults = commsParams.filter((param) =>
        Object.values(param).join(' ').toLowerCase().includes(lowerCaseTerm)
      )
      handleSort(safetySearchResults, sortBy, 'safety')
      handleSort(commsSearchResults, sortBy, 'comms')
    }

    if (!term) {
      handleSort(safetyParams, sortBy, 'safety')
      handleSort(commsParams, sortBy, 'comms')
    }
    setSearchTerm(term)
  }

  return (
    <article className="flex h-full flex-col">
      <section className="pb-2">
        <div className="mb-4">
          Set mission parameters for {vehicleName}&apos;s{' '}
          <span className="text-teal-500" data-testid="mission name">
            {mission}
          </span>{' '}
          mission
        </div>
        <div className="py-4">
          <ul className="grid grid-cols-2 gap-4">
            <li>
              <Input
                name="Search parameters field"
                placeholder="Search parameters"
                className="ml-2 h-full"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </li>
            <li className="flex w-full items-center">
              <span>Sort by</span>
              <SelectField
                className="ml-1 mr-2 flex flex-grow"
                name="Sort by"
                options={sortOptions}
                value={sortBy}
                onSelect={handleSelect}
              />
            </li>
          </ul>
        </div>
      </section>
      <section className="grid flex-grow grid-rows-2 gap-2 overflow-hidden">
        {filteredSafetyParams.length > 0 && (
          <ParameterTable
            altHeaderLabel="SAFETY PARAMETERS"
            parameters={filteredSafetyParams}
            onParamUpdate={onSafetyUpdate}
            onVerifyValue={onVerifyValue}
            unitOptions={unitOptions}
          />
        )}
        {filteredCommsParams.length > 0 && (
          <ParameterTable
            altHeaderLabel="COMMS PARAMETERS"
            parameters={filteredCommsParams}
            onParamUpdate={onCommsUpdate}
            onVerifyValue={onVerifyValue}
            unitOptions={unitOptions}
          />
        )}
      </section>
      <StatDisplay
        className="flex-shrink-0 flex-grow-0"
        totalDistance={totalDistance}
        bottomDepth={bottomDepth}
        duration={duration}
      />
    </article>
  )
}
