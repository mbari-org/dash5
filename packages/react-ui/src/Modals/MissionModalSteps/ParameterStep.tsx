import React, { useEffect, useState } from 'react'
import { SelectOption } from '../../Fields/Select'
import { Input, SelectField } from '../../Fields'
import { ParameterTable, ParameterProps } from '../../Tables/ParameterTable'

export interface ParameterStepProps {
  vehicleName: string
  mission: string
  parameters: ParameterProps[]
  onParamUpdate: (name: string, newOverrideValue: string) => void
  onVerifyValue?: (param: string) => string
}

export const ParameterStep: React.FC<ParameterStepProps> = ({
  vehicleName,
  mission,
  parameters,
  onVerifyValue,
  onParamUpdate,
}) => {
  const [initialParameters, setInitialParameters] = useState(parameters)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredParameters, setFilteredParameters] =
    useState<ParameterProps[]>(parameters)
  const [sortBy, setSortBy] = useState('Order of Appearance')

  const sortOptions: SelectOption[] = [
    { id: 'Order of Appearance', name: 'Order of Appearance' },
    { id: 'Contains Overrides', name: 'Contains Overrides' },
    { id: 'No Overrides', name: 'No Overrides' },
  ]

  useEffect(() => {
    if (initialParameters !== parameters) {
      setInitialParameters(parameters)
      const updatedParams =
        [...filteredParameters].map((param) =>
          parameters.find(({ name }) => name === param.name)
        ) ?? []
      setFilteredParameters(updatedParams as ParameterProps[])
    }
  }, [filteredParameters, initialParameters, parameters])

  const handleSelect = (id: string | null) => {
    id && setSortBy(id)
    id && handleSort([...filteredParameters], id)
  }

  const handleSort = (arr: ParameterProps[], id: string) => {
    const overrideSort = [...arr].sort(
      (a, b) => (b?.overrideValue ? 1 : 0) - (a?.overrideValue ? 1 : 0)
    )
    const noOverrideSort = [...arr].sort(
      (a, b) => (a?.overrideValue ? 1 : 0) - (b?.overrideValue ? 1 : 0)
    )

    const originalOrder = parameters.filter((param) => arr.includes(param))

    switch (id) {
      case 'Contains Overrides':
        setFilteredParameters(overrideSort)
        console.log(filteredParameters)
        return
      case 'No Overrides':
        setFilteredParameters(noOverrideSort)
        console.log(filteredParameters)
        return
      default:
        setFilteredParameters(originalOrder)
        console.log(filteredParameters)
        return
    }
  }

  const handleSearch = (term: string) => {
    if (term) {
      const lowerCaseTerm = term.toLowerCase()
      const searchResults = parameters.filter((param) =>
        Object.values(param).join(' ').toLowerCase().includes(lowerCaseTerm)
      )
      handleSort(searchResults, sortBy)
    }

    if (!term) handleSort(parameters, sortBy)
    setSearchTerm(term)
  }

  return (
    <article className="h-full">
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

      <ParameterTable
        className="max-h-[calc(100%-110px)]"
        parameters={filteredParameters}
        onParamUpdate={onParamUpdate}
        onVerifyValue={onVerifyValue}
      />
    </article>
  )
}
