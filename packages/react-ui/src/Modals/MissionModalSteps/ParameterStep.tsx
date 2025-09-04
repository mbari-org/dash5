import React, { useMemo, useState } from 'react'
import { SelectOption } from '../../Fields/Select'
import { Input, SelectField } from '../../Fields'
import {
  ParameterProps,
  ParameterTableProps,
} from '../../Tables/ParameterTable'
import { AccordionParameterTable } from '../../Tables/AccordionParameterTable'
import { StatDisplay, StatProps } from './StatDisplay'
import { humanize } from '@mbari/utils'

export interface ParameterStepProps extends StatProps {
  vehicleName: string
  mission: string
  parameters: ParameterProps[]
  onParamUpdate: ParameterTableProps['onParamUpdate']
  onVerifyValue?: (param: string) => string
  unitOptions?: ParameterTableProps['unitOptions']
}

export const ParameterStep: React.FC<ParameterStepProps> = ({
  vehicleName,
  mission,
  parameters,
  totalDistance,
  bottomDepth,
  duration,
  onVerifyValue,
  onParamUpdate,
  unitOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Order of Appearance')

  const sortOptions: SelectOption[] = [
    { id: 'Order of Appearance', name: 'Order of Appearance' },
    { id: 'Contains Overrides', name: 'Contains Overrides' },
    { id: 'No Overrides', name: 'No Overrides' },
  ]

  const filteredParameters = useMemo(() => {
    const source = parameters ?? []
    const indexed = source.map((p, idx) => ({ p, idx }))

    const term = searchTerm.trim().toLowerCase()
    let list = term
      ? indexed.filter(({ p }) =>
          Object.values(p).join(' ').toLowerCase().includes(term)
        )
      : indexed

    const overrideScore = (p: ParameterProps) => (p?.overrideValue ? 1 : 0)

    if (sortBy === 'Contains Overrides') {
      list = [...list].sort((a, b) => {
        const diff = overrideScore(b.p) - overrideScore(a.p)
        return diff || a.idx - b.idx
      })
    } else if (sortBy === 'No Overrides') {
      list = [...list].sort((a, b) => {
        const diff = overrideScore(a.p) - overrideScore(b.p)
        return diff || a.idx - b.idx
      })
    } else {
      // Order of Appearance
      list = [...list].sort((a, b) => a.idx - b.idx)
    }

    return list.map(({ p }) => p)
  }, [parameters, searchTerm, sortBy])

  const handleSelect = (id: string | null) => {
    if (id) setSortBy(id)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const groupOrder = useMemo(() => {
    const seen = new Set<string>()
    const order: string[] = []
    parameters.forEach((p) => {
      if (p.insert && !seen.has(p.insert)) {
        seen.add(p.insert)
        order.push(p.insert)
      }
    })
    return order
  }, [parameters])

  // Group parameters: first group is root level parameters, remaining by insert name
  const groups = useMemo(() => {
    const noInsert: ParameterProps[] = []
    const insertToParams = new Map<string, ParameterProps[]>()

    filteredParameters.forEach((p) => {
      if (p.insert) {
        if (!insertToParams.has(p.insert)) insertToParams.set(p.insert, [])
        insertToParams.get(p.insert)?.push(p)
      } else {
        noInsert.push(p)
      }
    })

    const orderedInsertGroups = groupOrder.map((key) => ({
      key,
      label: key,
      parameters: insertToParams.get(key) ?? [],
    }))

    const result = [
      { key: 'root', label: mission, parameters: noInsert },
      ...orderedInsertGroups,
    ].filter((g) => g.parameters.length > 0)

    return result
  }, [filteredParameters, mission, groupOrder])

  // Manage open state of each group
  const [openByGroup, setOpenByGroup] = useState<Record<string, boolean>>({
    root: true,
  })

  return (
    <article className="flex h-full flex-col">
      <section className="pb-2">
        <div>
          Set mission parameters for {vehicleName}&apos;s{' '}
          <span className="text-teal-500" data-testid="mission name">
            {mission}
          </span>{' '}
          mission
        </div>
        <div className="py-2">
          <ul className="grid grid-cols-2 gap-4">
            <li>
              <Input
                name="Search parameters field"
                placeholder="Search parameters"
                className="h-full"
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

      <div className="flex flex-col gap-4 overflow-y-auto pr-4">
        {groups.map((group) => (
          <AccordionParameterTable
            key={group.key}
            label={humanize(group.label, true)}
            parameters={group.parameters}
            onParamUpdate={onParamUpdate}
            unitOptions={unitOptions}
            open={!!openByGroup[group.key]}
            onToggle={(open) =>
              setOpenByGroup((prev) => ({ ...prev, [group.key]: open }))
            }
          />
        ))}
      </div>
      <StatDisplay
        className="flex-shrink-0 flex-grow-0"
        totalDistance={totalDistance}
        bottomDepth={bottomDepth}
        duration={duration}
      />
    </article>
  )
}
