import React from 'react'
import clsx from 'clsx'
import { Table } from '../Data/Table'
import { Select, SelectOption, SelectOptionGroup } from '../Fields/Select'
import { MissionCascader } from '../Fields/MissionCascader'
import { Input } from '../Fields/Input'

export const L_SEPARATOR = '____'
export const V_SEPARATOR = '::::'

export type ArgumentType =
  | 'ARG_COMMAND'
  | 'ARG_COMPONENT'
  | 'ARG_FLOAT'
  | 'ARG_INT'
  | 'ARG_SECONDS'
  | 'ARG_QUOTED_STRING'
  | 'ARG_STRING'
  | 'ARG_REGEX'
  | 'ARG_TIMESTAMP'
  | 'ARG_TOKEN'
  | 'ARG_KEYWORD'
  | 'ARG_MISSION'
  | 'ARG_SERVICE_TYPE'
  | 'ARG_UNIT'
  | 'ARG_UNIVERSAL'
  | 'ARG_VARIABLE'
  | 'ARG_NONE'
  | 'ARG_CONFIG_VARIABLE'
  | 'ARG_LIST'
  | 'ARG_DECIMATION_TYPE'

export interface CommandDetailProps {
  className?: string
  style?: React.CSSProperties
  parameters: CommandParameter[]
  onSelect: (param: string, argType: ArgumentType, value: string) => void
}

export interface OptionSet {
  name: string
  options: string[]
  /** When provided, groups options under labelled headings inside a single dropdown. */
  groupBy?: (option: string) => string
  /** Mission base names (without extension) to pin at the top as "Recently used". */
  pinnedNames?: string[]
  /** Optional display label overrides keyed by option value (e.g. { h: 'hour', min: 'minute' }). */
  optionLabels?: Record<string, string>
}

export interface HelpLink {
  label: string
  url: string
}

export interface CommandParameter {
  argType: ArgumentType
  name: string
  description: string
  helpLinks?: HelpLink[]
  value?: string
  options?: OptionSet[]
  inputType: 'string' | 'boolean' | 'number'
  required?: boolean
}

export interface ScopedOptionGroup {
  name: string
  value?: string
  options: SelectOption[]
  groupedOptions?: SelectOptionGroup[]
  pinnedNames?: string[]
}

export const explodeValues = (valueString: string) =>
  valueString.split(V_SEPARATOR)

export const splitValues = (valueString: string) =>
  explodeValues(valueString).map((v) => v.split(L_SEPARATOR))

export const mapValues = (valueString: string) =>
  splitValues(valueString).reduce((acc, [k, v]) => {
    if (k) acc[k] = v
    return acc
  }, {} as Record<string, string>)

export const getValues = (valueString: string) =>
  splitValues(valueString).map((v) => v[1])

export const scopedValues = (valueString: string) =>
  valueString.length < 1
    ? []
    : explodeValues(valueString).map((v, i, a) =>
        i > 0 ? a.slice(0, i + 1).join(V_SEPARATOR) : v
      )

export const scopedSelectOptions = (
  valueString: string | undefined,
  optionSets: OptionSet[]
): ScopedOptionGroup[] => {
  const values = scopedValues(valueString ?? '')
  const options = optionSets
    .filter((_, i) => i <= values.length)
    .map(({ name, options, groupBy, pinnedNames, optionLabels }, i) => {
      const buildId = (option: string) =>
        [i ? values[i - 1] : '', [name, option].join(L_SEPARATOR)]
          .filter((x) => x)
          .join(V_SEPARATOR)

      const stripExt = (s: string) => s.replace(/\.(tl|xml|py)$/i, '')

      const displayName = (option: string) =>
        optionLabels?.[option] ??
        (groupBy ? stripExt(option.split('/').pop() ?? option) : option)

      const flatOptions: SelectOption[] = options.map((option) => ({
        id: buildId(option),
        name: displayName(option),
      }))

      let groupedOptions: SelectOptionGroup[] | undefined
      if (groupBy) {
        const map = new Map<string, SelectOption[]>()
        options.forEach((option) => {
          const label = groupBy(option)
          if (!map.has(label)) map.set(label, [])
          map.get(label)!.push({
            id: buildId(option),
            name: stripExt(option.split('/').pop() ?? option),
          })
        })
        groupedOptions = Array.from(map.entries()).map(([label, opts]) => ({
          label,
          options: opts,
        }))
      }

      return {
        name,
        value: values[i],
        options: flatOptions,
        ...(groupedOptions !== undefined && { groupedOptions }),
        ...(pinnedNames !== undefined && { pinnedNames }),
      }
    })
  return options
}

const makePlaceholder = (name: string, required?: boolean) => {
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  return `${capitalized} (${required ? 'Required' : 'Optional'})`
}

const makeRow = (
  command: CommandParameter,
  onSelect: CommandDetailProps['onSelect']
) => {
  const {
    argType,
    name,
    description,
    helpLinks,
    value,
    options,
    required,
    inputType,
  } = command

  const handleSelect = (id: string) => {
    onSelect(name, argType, id)
  }

  const handleCheck = () => {
    onSelect(name, argType, value === 'true' ? 'false' : 'true')
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(name, argType, e.target.value)
  }

  var selectOptions: ScopedOptionGroup[] | undefined = undefined
  var input: JSX.Element | undefined = undefined
  switch (inputType) {
    case 'boolean':
      input = (
        <label htmlFor={name}>
          <input
            type="checkbox"
            name={name}
            className="h-4 w-4 align-middle accent-purple-800"
            onChange={handleCheck}
            checked={required || value === 'true'}
            disabled={required}
          />
          <span className="ml-2">Yes</span>
        </label>
      )
      break
    default:
      selectOptions = options ? scopedSelectOptions(value, options) : undefined
      input = !options ? (
        <Input
          name={name}
          value={value || ''}
          onChange={handleInput}
          placeholder={makePlaceholder(name, required)}
        />
      ) : undefined
  }

  return {
    cells: [
      { label: name },
      {
        label: (
          <span className="flex flex-wrap items-center gap-1">
            <span>{description}</span>
            {helpLinks?.map(({ label, url }) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-800"
              >
                {label}
              </a>
            ))}
          </span>
        ),
      },
      {
        label: selectOptions ? (
          <ul className="flex flex-col">
            {selectOptions?.map(
              ({ name, value, options, groupedOptions, pinnedNames }) => (
                <li key={name}>
                  {groupedOptions ? (
                    <MissionCascader
                      groups={groupedOptions}
                      value={value}
                      placeholder={makePlaceholder(name, required)}
                      onSelect={(id) => handleSelect(id || '')}
                      clearable={!required}
                      pinnedNames={pinnedNames}
                    />
                  ) : (
                    <Select
                      name={name}
                      options={options}
                      value={value}
                      placeholder={makePlaceholder(name, required)}
                      onSelect={(id) => handleSelect(id || '')}
                      clearable={!required}
                    />
                  )}
                </li>
              )
            )}
          </ul>
        ) : (
          <section className="flex h-full w-full items-center">{input}</section>
        ),
      },
    ],
  }
}

export const CommandDetailTable: React.FC<CommandDetailProps> = ({
  className,
  style,
  parameters,
  onSelect,
}) => (
  <article className={clsx('', className)} style={style}>
    <Table
      header={{ cells: [{ label: 'CONFIGSET' }] }}
      rows={parameters.map((parameter) => makeRow(parameter, onSelect))}
    />
  </article>
)

CommandDetailTable.displayName = 'Tables.CommandDetail'
