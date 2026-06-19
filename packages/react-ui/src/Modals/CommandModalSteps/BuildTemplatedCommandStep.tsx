import {
  ArgumentType,
  CommandDetailProps,
  CommandDetailTable,
  CommandParameter,
  getValues,
  OptionSet,
} from '../../Tables/CommandDetailTable'
import { useState, useEffect, useRef } from 'react'
import { SelectField, TextAreaField, TextAreaFieldProps } from '../../Fields'
import { SelectOption } from '../../Fields/Select'

export interface CommandSyntax {
  argList: Argument[]
  help: string
}

const argumentAsParameter = (
  arg: Argument,
  value?: string,
  options?: {
    units?: OptionSet[]
    moduleNames?: OptionSet[]
    decimationTypes?: OptionSet[]
    serviceTypes?: OptionSet[]
    missions?: OptionSet[]
    commands?: OptionSet[]
    variableTypes?: OptionSet[]
    universals?: OptionSet[]
  }
): CommandParameter => {
  switch (arg.argType) {
    case 'ARG_FLOAT':
      return {
        argType: arg.argType,
        name: arg?.altName ?? 'value',
        description: 'A numeric value (e.g. 1.5)',
        inputType: 'number',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_DECIMATION_TYPE':
      return {
        argType: arg.argType,
        name: 'decimation type',
        description: 'A decimation such as a linear approximation',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.decimationTypes ?? [],
      }
    case 'ARG_INT':
      return {
        argType: arg.argType,
        name: arg?.altName ?? 'integer',
        description: 'A whole number (e.g. 5)',
        inputType: 'number',
        value,
      }
    case 'ARG_SECONDS':
      return {
        argType: arg.argType,
        name: 'seconds',
        description: 'Time in seconds (e.g. 300)',
        inputType: 'number',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_QUOTED_STRING':
      return {
        argType: arg.argType,
        name: 'quoted string',
        description: 'A string value wrapped in quotes',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_STRING':
      return {
        argType: arg.argType,
        name: arg?.altName ?? 'string',
        description: 'A string value',
        inputType: 'string',
        value,
      }
    case 'ARG_REGEX':
      return {
        argType: arg.argType,
        name: 'regex',
        description: 'A regular expression',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_TIMESTAMP':
      return {
        argType: arg.argType,
        name: 'timestamp',
        description: 'A timestamp value',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_TOKEN':
      return {
        argType: arg.argType,
        name: arg?.altName ?? 'token',
        description: `A ${arg?.altName ?? 'token'} value`,
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_KEYWORD':
      return {
        argType: arg.argType,
        name: arg.keyword ?? 'keyword',
        description: 'A keyword value',
        inputType: 'boolean',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_MISSION':
      return {
        argType: arg.argType,
        name: 'mission',
        description: 'A mission name',
        inputType: 'string',
        value,
        options: options?.missions ?? [],
      }
    case 'ARG_SERVICE_TYPE':
      return {
        argType: arg.argType,
        name: 'service type',
        description: 'A service type',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.serviceTypes ?? [],
      }
    case 'ARG_UNIT':
      return {
        argType: arg.argType,
        name: 'variable unit',
        description: 'Unit for the value (e.g. count, meters, degrees)',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.units ?? [],
      }
    case 'ARG_UNIVERSAL':
      return {
        argType: arg.argType,
        name: 'universal',
        description: 'A universal value',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.universals ?? [],
      }
    case 'ARG_VARIABLE':
      return {
        argType: arg.argType,
        name: 'variable',
        description: 'Mission-level vs insert parameter syntax',
        helpLinks: [
          {
            label: 'Syntax guide',
            url: 'https://docs.mbari.org/tethysdash/mission/',
          },
          {
            label: 'LRAUV missions',
            url: 'https://docs.mbari.org/lrauvmissions/missions/',
          },
        ],
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.variableTypes ?? [],
      }
    case 'ARG_CONFIG_VARIABLE':
      return {
        argType: arg.argType,
        name: 'config variable',
        description: 'A config variable from a component element',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.moduleNames ?? [],
      }
    case 'ARG_LIST':
      return {
        argType: arg.argType,
        name: 'variable value(s) to set',
        description:
          'One or more numbers, comma-separated (e.g. 1 or 1.5, 2.0)',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_NONE':
      return {
        argType: arg.argType,
        name: 'none',
        description: 'No value',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
    case 'ARG_COMMAND':
      return {
        argType: arg.argType,
        name: 'command',
        description: 'A command name',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.commands ?? [],
      }
    case 'ARG_COMPONENT':
      return {
        argType: arg.argType,
        name: 'component',
        description: 'A component name',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
        options: options?.moduleNames?.slice(0, 2) ?? [],
      }
    default:
      return {
        argType: arg.argType,
        name: arg.argType,
        description: 'Unknown value',
        inputType: 'string',
        required: arg.required === 'REQUIRED',
        value,
      }
  }
}
export interface Argument {
  argType: ArgumentType
  keyword?: string
  altName?: string
  required?: string
}

export interface TemplateParameterConfig {
  [key: string]: string
}

export interface BuildTemplatedCommandStepProps {
  selectedCommandName?: string
  selectedSyntax: string | null
  onSelectSyntax: (syntax: string | null) => void
  selectedParameters?: TemplateParameterConfig
  syntaxVariations?: CommandSyntax[]
  units?: OptionSet[]
  moduleNames?: OptionSet[]
  missions?: OptionSet[]
  decimationTypes?: OptionSet[]
  serviceTypes?: OptionSet[]
  commands?: OptionSet[]
  variableTypes?: OptionSet[]
  universals?: OptionSet[]
  onUpdateField?: CommandDetailProps['onSelect']
  onCommandTextChange?: (text: string) => void
}

export const BuildTemplatedCommandStep: React.FC<
  BuildTemplatedCommandStepProps
> = ({
  selectedCommandName,
  syntaxVariations,
  units,
  moduleNames,
  serviceTypes,
  missions,
  decimationTypes,
  commands,
  universals,
  variableTypes,
  selectedParameters = {},
  selectedSyntax,
  onSelectSyntax: handleSelectSyntax,
  onUpdateField: handleUpdatedField,
  onCommandTextChange: handleCommandTextChange,
}) => {
  // Assign default syntax if none is selected
  useEffect(() => {
    if (syntaxVariations?.find(({ help }) => help === selectedSyntax)) return
    handleSelectSyntax(syntaxVariations?.[0]?.help ?? null)
  }, [selectedSyntax, syntaxVariations])

  const variations: SelectOption[] =
    syntaxVariations?.map((s) => ({
      id: s.help,
      name: s.help,
    })) ?? []

  const [_command, setCommand] = useState('')
  const handleChangedCommand: TextAreaFieldProps['onChange'] = (e) => {
    setCommand(e.target.value)
  }

  const argList =
    syntaxVariations?.find(({ help }) => help === selectedSyntax)?.argList ?? []

  const idForArg = (arg: Argument) =>
    arg.argType === 'ARG_KEYWORD'
      ? `<ARG_KEYWORD:${arg.keyword}>`
      : `<${arg.argType}>`

  const argumentAsTemplate = [selectedCommandName, argList.map(idForArg)]
    .flat()
    .join(' ')

  const formatValueForArg = (
    value: string | undefined,
    argType: ArgumentType
  ) => {
    const values = getValues(value ?? '')
    switch (argType) {
      case 'ARG_SERVICE_TYPE':
        return values[0] ? values[0] : value
      case 'ARG_DECIMATION_TYPE':
        return values[0] ? values[0] : value
      case 'ARG_UNIT':
        return values[0] ? values[0] : value
      case 'ARG_CONFIG_VARIABLE':
        return values.length > 2 ? values.slice(-2).join('.') : undefined
      case 'ARG_VARIABLE':
        if (values[0] === 'Universal') {
          return values?.slice(-1)[0] ?? undefined
        }
        if (values[0] === 'Mission' && values.length >= 2) {
          const missionFullPath = values[1]
          const element = values[2]
          if (!missionFullPath || !element) return undefined
          // Extract bare filename without extension (e.g. 'sci2_circle_hotspot',
          // 'foo-bar'). Basename + extension stripping handles all filename chars.
          const missionName =
            missionFullPath
              .split('/')
              .pop()
              ?.replace(/\.(tl|xml|py)$/i, '') ?? missionFullPath
          // element is 'ParamName' (root) or 'Insert.ParamName' (scoped)
          if (element.includes('.')) {
            return `${missionName}:${element}`
          }
          return `${missionName}.${element}`
        }
        if (values[0] === 'Component') {
          const component = values[2]
          const element = values[3]
          if (!component || !element) return undefined
          return `${component}.${element}`
        }
        return undefined
      case 'ARG_UNIVERSAL':
        return values?.slice(-1)[0] ?? undefined
      case 'ARG_COMPONENT':
        return value ? values[1] : value
      case 'ARG_COMMAND':
        return value ? values[0] : value
      case 'ARG_MISSION':
        if (!value) return value
        // Single-tier flat path (e.g. 'Science/sci2_circle_hotspot.tl')
        return values[0]
      case 'ARG_QUOTED_STRING':
        return value ? `"${value}"` : value
      default:
        return value
    }
  }

  const argumentAsCommand = argList
    .reduce((acc, arg) => {
      const id = idForArg(arg)
      const isKeyWord = arg.argType === 'ARG_KEYWORD'
      const isRequired = arg.required === 'REQUIRED'
      const value = formatValueForArg(
        selectedParameters[isKeyWord ? arg.keyword ?? '' : arg.argType],
        arg.argType
      )
      return isKeyWord
        ? acc.replace(
            id,
            value === 'true' || isRequired ? (arg.keyword as string) : ''
          )
        : acc.replace(id, value ?? (isRequired ? id : ''))
    }, argumentAsTemplate)
    .replace(/\s+/g, ' ')
    .trim()

  // Ensure this is blank on first render so that the side effect below runs.
  const persistedCommand = useRef('')
  useEffect(() => {
    if (persistedCommand.current === argumentAsCommand) return
    persistedCommand.current = argumentAsCommand
    handleCommandTextChange?.(argumentAsCommand)
  }, [argumentAsCommand, handleCommandTextChange])

  return (
    <section className="flex h-full flex-col">
      <ul className="flex flex-col">
        <li className="flex w-full items-center justify-between">
          <span>
            Build command{' '}
            <span className="text-teal-500" data-testid="vehicle name">
              {selectedCommandName}
            </span>
          </span>
          <a
            href="https://docs.mbari.org/tethysdash/mission/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
          >
            Mission Script Structure Guide
          </a>
        </li>
        <li className="my-4 flex w-full items-center">
          <p className="mr-2 flex-shrink-0">Choose a syntax</p>
          <SelectField
            name="syntax"
            placeholder=""
            options={variations}
            className="mr-8 w-full"
            value={selectedSyntax ?? undefined}
            onSelect={handleSelectSyntax}
          />
        </li>
        <li className="flex-shrink flex-grow">
          <CommandDetailTable
            parameters={argList.map((arg) =>
              argumentAsParameter(
                arg,
                selectedParameters[arg.keyword ?? arg.argType ?? ''],
                {
                  units,
                  moduleNames,
                  serviceTypes,
                  decimationTypes,
                  missions,
                  commands,
                  universals,
                  variableTypes,
                }
              )
            )}
            onSelect={handleUpdatedField ?? (() => {})}
          />
        </li>
        <li className="mt-4">
          <TextAreaField
            label="Command"
            name="command"
            onChange={handleChangedCommand}
            value={argumentAsCommand ?? undefined}
            textAreaClassNames="font-mono"
          />
        </li>
      </ul>
    </section>
  )
}
