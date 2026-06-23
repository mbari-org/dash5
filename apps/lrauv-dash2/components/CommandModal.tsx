import React, { useState } from 'react'
import {
  CommandModalView,
  CommandModalViewProps,
  mapValues,
  OptionSet,
  L_SEPARATOR,
  V_SEPARATOR,
} from '@mbari/react-ui'
import {
  useCommands,
  useFrequentCommands,
  useRecentCommands,
  useUnits,
  useModuleInfo,
  useUniversals,
  useMissionList,
  useScript,
  useCreateCommand,
  useSbdOutgoingAlternativeAddresses,
  CreateCommandParams,
  useSiteConfig,
} from '@mbari/api-client'
import { makeCommand } from '../lib/makeCommand'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import useGlobalModalId from '../lib/useGlobalModalId'

export interface CommandModalProps {
  onClose: () => void
  className?: string
  style?: React.CSSProperties
}

export const CommandModal: React.FC<CommandModalProps> = ({
  onClose,
  className,
  style,
}) => {
  const { globalModalId } = useGlobalModalId()
  const defaultCommand = globalModalId?.meta?.command
  const [currentCommandId, setCurrentCommand] = useState<
    string | null | undefined
  >(defaultCommand)

  const [hideAdvanced, setHideAdvanced] = useState(false)

  const [variable, setVariable] = useState<Record<string, string>>({
    'Variable Type': '',
    Mission: '',
    Module: '',
    Component: '',
    Element: '',
  })

  const steps = ['Command', 'Build', 'Schedule']
  const router = useRouter()
  const params = (router.query?.deployment ?? []) as string[]
  const vehicleName = params[0]

  // Network Mutations
  const { mutate: createCommand, isLoading: sendingCommand } =
    useCreateCommand()

  const onCommandSuccess = () => {
    toast.success('Command sent')
    onClose()
  }

  const onCommandError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    toast.error(`Error sending command: ${message}`)
  }

  const sendCommand = (params: CreateCommandParams) => {
    createCommand(params, {
      onSuccess: onCommandSuccess,
      onError: onCommandError,
    })
  }

  // Network supplied data
  const { data: vehicleInfo } = useSiteConfig()
  const vehicles = vehicleInfo?.vehicleNames ?? []
  const { data: unitsData } = useUnits()
  const { data: commandData } = useCommands()
  const { data: recentCommandsData } = useRecentCommands({
    vehicle: vehicleName,
  })
  const { data: frequentCommandsData } = useFrequentCommands({
    vehicle: vehicleName,
  })
  const { data: alternativeAddresses } = useSbdOutgoingAlternativeAddresses({})
  const { data: moduleInfoData } = useModuleInfo()
  const { data: universalData } = useUniversals({})
  const { data: missionData } = useMissionList()
  // Mission tier now stores the full path (e.g. 'Science/sci2_circle_hotspot.tl')
  const missionPath = variable.Mission ?? ''
  const { data: selectedMissionData } = useScript(
    {
      path: missionPath,
      gitRef: missionData?.gitRef ?? 'master',
    },
    { enabled: missionPath !== '' }
  )

  const handleAmendCommand = (commandText: string): Record<string, string> => {
    const params: Record<string, string> = {}
    // Parse: set <mission>[.:]<element> <rest>
    // Capture the entire rest-of-line so multi-token values (ARG_LIST) are
    // preserved. The last space-delimited token is treated as an optional unit.
    const setMatch = commandText.match(
      /^set\s+([a-zA-Z0-9_]+)([.:])([a-zA-Z0-9_.]+)\s+(.+)$/
    )
    if (setMatch) {
      const [, missionName, separator, paramPart, rest] = setMatch
      const lastSpace = rest.lastIndexOf(' ')
      const value = lastSpace >= 0 ? rest.slice(0, lastSpace) : rest
      const unit = lastSpace >= 0 ? rest.slice(lastSpace + 1) : undefined

      // Find full mission path (e.g. "Science/sci2_circle_hotspot.tl")
      const fullPath = allMissionPaths.find((p) => {
        const base = p
          .split('/')
          .pop()
          ?.replace(/\.(tl|xml|py)$/i, '')
        return base === missionName
      })

      if (fullPath) {
        // Element: root param or Insert.Param
        const element = separator === ':' ? paramPart : paramPart

        // Build cumulative option ID matching what CommandDetailTable produces
        const varTypeTier = `Variable Type${L_SEPARATOR}Mission`
        const missionTier = `Mission${L_SEPARATOR}${fullPath}`
        const elementTier = `Element${L_SEPARATOR}${element}`
        const cumulativeId = [varTypeTier, missionTier, elementTier].join(
          V_SEPARATOR
        )

        params['ARG_VARIABLE'] = cumulativeId
        setVariable(mapValues(cumulativeId))
      }

      if (value) params['ARG_LIST'] = value
      // Encode unit with the OptionSet name so the Select dropdown matches correctly
      if (unit) params['ARG_UNIT'] = `Units${L_SEPARATOR}${unit}`
    }

    return params
  }

  const handleUpdatedField: CommandModalViewProps['onUpdateField'] = (
    _param,
    argType,
    value
  ) => {
    if (
      argType === 'ARG_VARIABLE' ||
      argType === 'ARG_COMPONENT' ||
      argType === 'ARG_CONFIG_VARIABLE' ||
      argType === 'ARG_MISSION'
    ) {
      setVariable(mapValues(value))
    }
  }

  const makeModuleNames = (config: { Module?: string; Component?: string }) => [
    { name: 'Module', options: moduleInfoData?.moduleNames ?? [] },
    {
      name: 'Component',
      options: config?.Module
        ? moduleInfoData?.sensors?.[config?.Module ?? '']
            ?.map((s) => s.string)
            ?.sort() ?? []
        : [],
    },
    {
      name: 'Element',
      options:
        config?.Module && config?.Component
          ? moduleInfoData?.uris?.[config?.Module ?? '']?.[
              config?.Component ?? ''
            ]
              ?.map((e) => e.string)
              ?.sort() ?? []
          : [],
    },
  ]
  const moduleNames = makeModuleNames(variable)

  const allUnitAbbreviations = unitsData?.map((u) => u.abbreviation) ?? []

  // When a Mission element is selected, derive its unit from the script args and
  // filter the units dropdown to only show compatible options (same baseUnit).
  // Falls back to all units if no unit info is available for the selected parameter.
  const selectedArgUnit = React.useMemo(() => {
    if (
      variable['Variable Type'] !== 'Mission' ||
      !variable.Element ||
      !selectedMissionData
    )
      return undefined
    const element = variable.Element
    const rootArg = selectedMissionData.scriptArgs?.find(
      (a) => a.name === element
    )
    if (rootArg?.unit) return rootArg.unit
    for (const ins of selectedMissionData.inserts ?? []) {
      const insArg = ins.scriptArgs?.find(
        (a) => `${ins.id}.${a.name}` === element
      )
      if (insArg?.unit) return insArg.unit
    }
    return undefined
  }, [variable, selectedMissionData])

  const filteredUnitAbbreviations = React.useMemo(() => {
    if (!selectedArgUnit) return allUnitAbbreviations
    const compatible =
      unitsData
        ?.filter(
          (u) => u.name === selectedArgUnit || u.baseUnit === selectedArgUnit
        )
        .map((u) => u.abbreviation) ?? []
    return compatible.length > 0 ? compatible : allUnitAbbreviations
  }, [unitsData, selectedArgUnit, allUnitAbbreviations])

  // Display aliases: shown in UI but the original keyword is still sent to the vehicle
  const COMMAND_DISPLAY_ALIASES: Record<string, string> = {
    failComponent: 'failc',
  }

  const commands =
    commandData?.commands.map((c) => ({
      id: c.keyword,
      name: COMMAND_DISPLAY_ALIASES[c.keyword] ?? c.keyword,
      description: c.description,
      advanced: c.advanced,
    })) ?? []

  const recentCommands =
    recentCommandsData?.map((c) => ({
      id: (c?.id ?? '') as string,
      name: c?.writtenCommand ?? 'n/a',
      description: c?.note ?? 'no notes',
    })) ?? []

  const frequentCommands =
    frequentCommandsData?.map((c) => ({
      id: c?.writtenCommand ?? c?.command?.keyword ?? 'n/a',
      name: c?.writtenCommand ?? 'n/a',
      description: commandData?.commands.find(
        (cd) => cd.keyword === c?.command?.keyword
      )?.description,
    })) ?? []

  const handleSchedule: CommandModalViewProps['onSchedule'] = ({
    confirmedVehicle,
    commandText,
    scheduleMethod,
    specifiedTime,
    alternateAddress,
    notes,
    commType,
    timeout,
  }) => {
    const { commandText: formattedCommandText, schedDate } = makeCommand({
      commandText,
      scheduleMethod,
      specifiedLocalTime: specifiedTime,
      units: unitsData,
    })

    sendCommand({
      vehicle: confirmedVehicle?.toLowerCase() ?? '',
      commandNote: notes ?? '',
      schedDate,
      destinationAddress: alternateAddress ?? undefined,
      commandText: formattedCommandText,
      via: commType,
      timeout,
    })
  }

  const syntaxVariations = commandData?.commands.find(
    (c) => c.keyword === currentCommandId
  )?.syntaxList

  const decimationTypes = commandData?.decimationTypes ?? []
  const serviceTypes = commandData?.serviceTypes ?? []

  // Flat sorted mission paths for both ARG_VARIABLE and ARG_MISSION pickers.
  const allMissionPaths = (missionData?.list?.map((m) => m.path) ?? []).sort()

  // Groups paths by folder prefix for the grouped dropdown headers.
  const missionGroupBy = (path: string) => {
    const slash = path.lastIndexOf('/')
    return slash >= 0 ? path.slice(0, slash) : 'Standard Ops'
  }

  // Extract unique mission base names from recent commands (set/load) for pinning.
  const recentMissionNames = React.useMemo(() => {
    const names = new Set<string>()
    recentCommandsData?.forEach((c) => {
      const cmd = c?.writtenCommand ?? ''
      // set missionname.param ... or set missionname:Section.param ...
      const setMatch = cmd.match(/^set\s+([a-zA-Z0-9_]+)[.:]/)
      if (setMatch) names.add(setMatch[1])
      // load path/missionname.tl/.xml/.py
      const loadMatch = cmd.match(
        /load\s+(?:\S+\/)?([a-zA-Z0-9_]+)\.(tl|xml|py)/i
      )
      if (loadMatch) names.add(loadMatch[1])
    })
    return Array.from(names).slice(0, 5)
  }, [recentCommandsData])

  // Single-tier grouped mission picker for ARG_MISSION (e.g. load, run).
  const missionTypeOptions = [
    {
      name: 'Mission',
      options: allMissionPaths,
      groupBy: missionGroupBy,
      pinnedNames: recentMissionNames,
    },
  ]

  // Flat Element list: root params as 'ParamName', insert params as 'Insert.ParamName'.
  const elementOptions = selectedMissionData
    ? [
        ...(selectedMissionData.scriptArgs ?? []).map((a) => a.name),
        ...(selectedMissionData.inserts ?? []).flatMap((ins) =>
          (ins.scriptArgs ?? []).map((a) => `${ins.id}.${a.name}`)
        ),
      ].sort()
    : []

  const variableTypes: OptionSet[] = [
    { name: 'Variable Type', options: ['Mission', 'Universal', 'Component'] },
  ]
  switch (variable['Variable Type']) {
    case 'Mission': {
      // Tier 2: grouped mission list — folders as headers, filenames as options
      variableTypes.push({
        name: 'Mission',
        options: allMissionPaths,
        groupBy: missionGroupBy,
        pinnedNames: recentMissionNames,
      })
      // Tier 3: flat element list built once mission data is loaded
      if (variable.Mission && selectedMissionData) {
        variableTypes.push({ name: 'Element', options: elementOptions })
      }
      break
    }
    case 'Universal':
      variableTypes.push({
        name: 'Universal',
        options: universalData ?? [],
      })
      break
    case 'Component':
      makeModuleNames(variable).forEach((m) => variableTypes.push(m))
      break
  }

  return (
    <CommandModalView
      className={className}
      style={style}
      commands={commands}
      recentCommands={recentCommands}
      frequentCommands={frequentCommands}
      currentStepIndex={defaultCommand ? 1 : 0}
      onSchedule={handleSchedule}
      onCancel={onClose}
      vehicleName={vehicleName}
      steps={steps}
      onSelectCommandId={setCurrentCommand}
      syntaxVariations={syntaxVariations ?? []}
      units={[{ name: 'Units', options: filteredUnitAbbreviations }]}
      universals={[{ name: 'Universal', options: universalData ?? [] }]}
      missions={missionTypeOptions}
      decimationTypes={[{ name: 'Decimation Type', options: decimationTypes }]}
      serviceTypes={[{ name: 'Service Type', options: serviceTypes }]}
      variableTypes={variableTypes}
      showAdvanced={!hideAdvanced}
      onToggleAdvanced={() => setHideAdvanced((v) => !v)}
      onAmendCommand={handleAmendCommand}
      onUpdateField={handleUpdatedField}
      onResetParameters={() =>
        setVariable({
          'Variable Type': '',
          Mission: '',
          Module: '',
          Component: '',
          Element: '',
        })
      }
      moduleNames={moduleNames}
      vehicles={vehicles}
      alternativeAddresses={alternativeAddresses ?? []}
      loading={sendingCommand}
      defaultCommand={defaultCommand ?? undefined}
    />
  )
}
