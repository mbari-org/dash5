import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { ParameterField } from './ParameterField'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface ParameterTableProps {
  className?: string
  style?: React.CSSProperties
  parameters: Parameter[]
  onVerifyValue: (value: string) => string
}

interface Parameter {
  name: string
  description: string
  defaultValue: string
  dvlOff?: boolean
  overrideValue?: string
}

export const ParameterTable: React.FC<ParameterTableProps> = ({
  className,
  style,
  parameters,
  onVerifyValue,
}) => {
  const ParameterRows = parameters.map(
    ({ name, description, defaultValue, overrideValue, dvlOff }) => {
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
            highlighted: true, // removes scrollable table styles on this cell
          },
          {
            label: (
              <div>
                <span className="text-stone-600/60">{defaultValue}</span>
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
                customValue={overrideValue}
                onVerifyValue={onVerifyValue}
              />
            ),
            highlighted: true,
            highlightedStyle: 'text-base text-teal-600',
          },
        ],
      }
    }
  )

  return (
    <div className={clsx('', className)} style={style}>
      <Table
        scrollable
        grayHeader
        header={{
          cells: [
            {
              label: 'PARAMETER',
            },
            {
              label: 'DEFAULT VALUE',
            },
            { label: 'OVERRIDE VALUE' },
          ],
        }}
        rows={ParameterRows}
      />
    </div>
  )
}

ParameterTable.displayName = 'Tables.ParameterTable'
