import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { ParameterField } from './ParameterField'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { makeValueUnitString } from '@mbari/utils'

export interface ParameterTableProps {
  className?: string
  style?: React.CSSProperties
  parameters: ParameterProps[]
  onParamUpdate: (name: string, newOverrideValue: string) => void
  onVerifyValue?: (value: string) => string
}

export interface ParameterProps {
  name: string
  description?: string
  value: string
  unit?: string
  dvlOff?: boolean
  overrideValue?: string
}

export const ParameterTable: React.FC<ParameterTableProps> = ({
  className,
  style,
  parameters,
  onParamUpdate,
  onVerifyValue,
}) => {
  const ParameterRows = parameters.map(
    ({ name, description, value, unit, overrideValue, dvlOff }) => {
      const handleOverride = (newValue: string) => {
        onParamUpdate(name, newValue)
      }

      return {
        cells: [
          {
            label: (
              <span
                className={clsx(
                  'font-medium',
                  overrideValue && 'text-teal-600',
                  !overrideValue && dvlOff && 'text-orange-500/80',
                  !overrideValue && !dvlOff && 'opacity-60'
                )}
              >
                {name}
              </span>
            ),
            secondary: (
              <span className="text-stone-600/60 ">{description}</span>
            ),
            span: 2,
            highlighted: true, // removes scrollable table styles on this cell
          },
          {
            label: (
              <div>
                <span className="text-stone-600/60">
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
            ),
            highlighted: true,
            highlightedStyle: 'text-base',
          },
          {
            label: (
              <ParameterField
                overrideValue={overrideValue}
                onOverride={handleOverride}
                onVerifyValue={onVerifyValue}
              />
            ),
            span: 2,
            highlighted: true,
            highlightedStyle: 'text-base text-teal-600',
          },
        ],
      }
    }
  )

  return (
    <Table
      className={className}
      style={style}
      scrollable
      grayHeader
      colInRow={5}
      header={{
        cells: [
          {
            label: 'PARAMETER',
            span: 2,
          },
          {
            label: 'DEFAULT VALUE',
          },
          { label: 'OVERRIDE VALUE', span: 2 },
        ],
      }}
      rows={ParameterRows}
    />
  )
}

ParameterTable.displayName = 'Tables.ParameterTable'
