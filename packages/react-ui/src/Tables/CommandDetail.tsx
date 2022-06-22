import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select } from '../Fields/Select'

export interface CommandDetailProps {
  className?: string
  style?: React.CSSProperties
  commands: CommandParameter[]
  onSelect: (param: string, value: string) => void
}

export interface CommandParameter {
  name: string
  description: string
  value?: string
  options?: string[]
}

export const CommandDetail: React.FC<CommandDetailProps> = ({
  className,
  style,
  commands,
  onSelect,
}) => {
  const Row = (command: CommandParameter) => {
    const { name, description, value, options } = command

    const selectOptions = options?.map((option) => ({
      id: option,
      name: option,
    }))

    const handleSelect = (id: string) => {
      onSelect(name, id)
    }

    const handleCheck = (id: boolean) => {
      onSelect(name, String(id))
    }

    return {
      cells: [
        { label: name },
        { label: description },
        {
          label: options ? (
            <Select
              name="command parameters"
              options={selectOptions}
              value={value || ''}
              onSelect={(id) => handleSelect(id || '')}
            />
          ) : (
            <div className="flex h-full w-full items-center">
              <label htmlFor="parameter checkbox">
                <input
                  type="checkbox"
                  name="parameter checkbox"
                  className="h-4 w-4 align-middle accent-purple-800"
                  onChange={(e) => handleCheck(e.target.checked)}
                />
                <span className="ml-2">Yes</span>
              </label>
            </div>
          ),
        },
      ],
    }
  }

  const commandRows = commands.map((command) => Row(command))

  return (
    <article className={clsx('', className)} style={style}>
      <Table header={{ cells: [{ label: 'CONFIGSET' }] }} rows={commandRows} />
    </article>
  )
}

CommandDetail.displayName = 'Tables.CommandDetail'
