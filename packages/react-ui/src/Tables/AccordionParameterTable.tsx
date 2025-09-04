import React, { useMemo } from 'react'
import clsx from 'clsx'
import { AccordionHeader } from '../Navigation/AccordionHeader'
import { AccordionCells } from '../Cells/AccordionCells'
import { Virtualizer } from '../Cells'
import { ParameterField, ParameterFieldUnit } from './ParameterField'
import { ParameterProps } from './ParameterTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { makeValueUnitString } from '@mbari/utils'

export interface AccordionParameterTableProps {
  className?: string
  style?: React.CSSProperties
  label: string
  secondaryLabel?: string
  ariaLabel?: string
  onExpand?: () => void
  onToggle: (open: boolean) => void
  open?: boolean
  parameters?: ParameterProps[]
  onParamUpdate: (
    name: string,
    overrideValue: string,
    overrideUnit?: string
  ) => void
  unitOptions?: ParameterFieldUnit[]
  loading?: boolean
}

export const AccordionParameterTable: React.FC<
  AccordionParameterTableProps
> = ({
  className,
  style,
  label,
  onExpand,
  onToggle,
  open,
  parameters = [],
  onParamUpdate,
  unitOptions,
  loading,
}) => {
  const getParamKey = (name: string, insert?: string) =>
    insert ? `${insert}:${name}` : name

  const items = useMemo(
    () =>
      parameters
        ?.filter((p) => p?.name)
        .map(
          ({
            name,
            description,
            value,
            unit,
            overrideValue,
            overrideUnit,
            dvlOff,
            insert,
          }) => {
            const uniqueKey = getParamKey(name, insert)
            const handleOverride = (newValue: string, newUnit?: string) => {
              onParamUpdate(uniqueKey, newValue, newUnit)
            }

            return {
              id: uniqueKey,
              render: (_index: number, _virtualizer: Virtualizer) => (
                <div className="grid grid-cols-8 items-center gap-4 border-b-2 border-stone-200 px-4 py-2">
                  <div className="col-span-3">
                    <span
                      className={clsx(
                        'whitespace-normal break-words font-medium',
                        overrideValue && 'text-teal-600',
                        !overrideValue && dvlOff && 'text-orange-500/80',
                        !overrideValue && !dvlOff && 'opacity-60'
                      )}
                    >
                      {name}
                    </span>
                    {description && (
                      <div className="break-words text-sm text-stone-600/60">
                        {description}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div>
                      <span className="whitespace-normal break-words text-stone-600/60">
                        {makeValueUnitString(value, unit)}
                      </span>
                      {dvlOff && (
                        <span className="ml-4 text-orange-500/80">
                          DVL is off
                          <FontAwesomeIcon
                            icon={faInfoCircle as IconProp}
                            className="ml-2"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <ParameterField
                      overrideValue={overrideValue}
                      onOverride={handleOverride}
                      overrideUnit={overrideUnit}
                      unit={unit}
                      unitOptions={unitOptions}
                      name={name}
                      defaultValue={value}
                    />
                  </div>
                </div>
              ),
            }
          }
        ) ?? [],
    [parameters, onParamUpdate, unitOptions]
  )

  const headerCellClass =
    'flex flex-grow text-left font-sans text-sm items-center py-2 opacity-60'
  const headerRowClass = 'whitespace-nowrap border-b-2 border-stone-200'

  return (
    <div
      className={clsx(
        'flex flex-col border-2 border-stone-200',
        open && 'h-3/4',
        className
      )}
      style={style}
    >
      <AccordionHeader
        className="top-0 z-10"
        label={`${label} parameters:`}
        ariaLabel={label}
        onExpand={onExpand}
        onToggle={onToggle}
        open={open}
      />
      <div
        className={clsx(
          'relative flex min-h-0 flex-1 flex-col',
          !open && 'hidden'
        )}
        aria-hidden={!open}
      >
        <AccordionCells
          className="min-h-0 flex-1"
          header={
            <div
              className={clsx(
                'sticky top-0 left-0 z-10 grid grid-cols-8 gap-4 bg-stone-100 px-4',
                headerRowClass
              )}
            >
              <div className={clsx('col-span-3', headerCellClass)}>
                PARAMETER
              </div>
              <div className={clsx('col-span-2', headerCellClass)}>
                DEFAULT VALUE
              </div>
              <div className={clsx('col-span-3', headerCellClass)}>
                OVERRIDE VALUE
              </div>
            </div>
          }
          cellAtIndex={(index, virtualizer) =>
            items[index]?.render(index, virtualizer)
          }
          count={items.length}
          loading={loading}
          maxHeight="max-h-full"
        />
      </div>
    </div>
  )
}

AccordionParameterTable.displayName = 'Tables.AccordionParameterTable'
