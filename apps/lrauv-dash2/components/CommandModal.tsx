import React, { useState, useRef, useEffect } from 'react'
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

/** Pure helper — exported for testing. Returns the group label for a mission path, collapsing all Deprecated/* sub-paths into the single label "Deprecated" so the mission picker renders them as one deprioritized group at the bottom. */
export const missionGroupLabel = (path: string): string => {
  if (path.toLowerCase().startsWith('deprecated/')) return 'Deprecated'
  const slash = path.lastIndexOf('/')
  return slash >= 0 ? path.slice(0, slash) : 'Standard Ops'
}

/** Pure helper — exported for testing. Sorts mission paths alphabetically with Deprecated/ pinned last. */
export const sortMissionPaths = (a: string, b: string): number => {
  const aDeprecated = a.toLowerCase().startsWith('deprecated/')
  const bDeprecated = b.toLowerCase().startsWith('deprecated/')
  if (aDeprecated !== bDeprecated) return aDeprecated ? 1 : -1
  return a.localeCompare(b)
}

export interface UnitEntry {
  name: string
  abbreviation: string
  baseUnit?: string
}

/** Pure helper — exported for testing. */
export const getFilteredUnitAbbreviations = (
  unitsData: UnitEntry[] | undefined,
  selectedArgUnit: string | undefined
): string[] => {
  const all = unitsData?.map((u) => u.abbreviation) ?? []
  if (!selectedArgUnit) return all
  const selectedUnitEntry = unitsData?.find((u) => u.name === selectedArgUnit)
  const canonicalBase = selectedUnitEntry?.baseUnit ?? selectedArgUnit
  const compatible =
    unitsData
      ?.filter((u) => u.name === canonicalBase || u.baseUnit === canonicalBase)
      .map((u) => u.abbreviation) ?? []
  // Mirror ParameterField: sort time-based units by abbreviation length
  // so short forms (s, h, d) appear before longer ones (min, ms, etc.)
  if (canonicalBase === 'second') {
    compatible.sort((a, b) => a.length - b.length)
  }
  return compatible.length > 0 ? compatible : all
}

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

  // Stable ref wired by CommandModalView so we can push corrected ARG_VARIABLE
  // values after the mission script loads.
  const forceUpdateParamsRef = useRef<
    ((params: Record<string, string>) => void) | null
  >(null)

  // Stores the raw paramPart + missionPath from the most recent amend parse so
  // that the resolution useEffect below can find the correct element name once
  // selectedMissionData is available.
  const pendingAmendRef = useRef<{
    missionPath: string
    paramPart: string
  } | null>(null)

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
    { enabled: missionPath !== '' && variable['Variable Type'] === 'Mission' }
  )

  const handleAmendCommand = (commandText: string): Record<string, string> => {
    const params: Record<string, string> = {}
    // Parse: set <mission>[.:]<element> <rest>
    // Capture the entire rest-of-line so multi-token values (ARG_LIST) are
    // preserved. The last space-delimited token is treated as an optional unit.
    const setMatch = commandText.match(
      /^set\s+([-a-zA-Z0-9_]+)([.:])([a-zA-Z0-9_.]+)\s+(.+)$/i
    )
    if (setMatch) {
      const [, missionName, separator, paramPart, rest] = setMatch
      // Only treat the trailing token as a unit when it matches a known unit
      // abbreviation. Without this guard, multi-token values like ARG_LIST
      // ("1.5, 2.0") would have their last number mis-parsed as a unit.
      const knownUnits = new Set(unitsData?.map((u) => u.abbreviation) ?? [])
      // LRAUV type annotations appear as trailing tokens in set commands but
      // are not returned by /commands/units (they're types, not physical units).
      const LRAUV_TYPE_ANNOTATIONS = new Set([
        'bool',
        'enum',
        'string',
        'int',
        'uint',
        'float',
        'double',
      ])
      const lastSpace = rest.lastIndexOf(' ')
      const candidate = lastSpace >= 0 ? rest.slice(lastSpace + 1) : ''
      const isKnownUnit =
        candidate !== '' &&
        (knownUnits.has(candidate) ||
          LRAUV_TYPE_ANNOTATIONS.has(candidate.toLowerCase()))
      const value = isKnownUnit ? rest.slice(0, lastSpace) : rest
      const unit = isKnownUnit ? candidate : undefined

      // Find full mission path (e.g. "Science/sci2_circle_hotspot.tl")
      const fullPath = allMissionPaths.find((p) => {
        const base = p
          .split('/')
          .pop()
          ?.replace(/\.(tl|xml|py)$/i, '')
        return base?.toLowerCase() === missionName.toLowerCase()
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

        // Store for deferred resolution: if paramPart is the bare name of an
        // insert arg (e.g. 'MedianFilterLen' → 'Science.MedianFilterLen'), the
        // useEffect below will correct ARG_VARIABLE once the script data loads.
        pendingAmendRef.current = { missionPath: fullPath, paramPart: element }
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
    // ARG_VARIABLE / ARG_COMPONENT / ARG_CONFIG_VARIABLE drive cascading
    // dropdowns via the variable state (Variable Type → Mission → Element).
    // ARG_MISSION (load/run commands) is intentionally excluded: the selected
    // mission is already captured in selectedParameters via the standard param
    // path, and merging it into variable would overwrite Variable Type / Element
    // and break the mission-script query for any prior set-command selection.
    if (
      argType === 'ARG_VARIABLE' ||
      argType === 'ARG_COMPONENT' ||
      argType === 'ARG_CONFIG_VARIABLE'
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

  // Display label map: abbreviation → human-readable name (e.g. h → hour, min → minute)
  const unitLabels: Record<string, string> = React.useMemo(
    () =>
      (unitsData ?? []).reduce<Record<string, string>>((acc, u) => {
        acc[u.abbreviation] = u.name.replace(/_/g, ' ')
        return acc
      }, {}),
    [unitsData]
  )

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

  const filteredUnitAbbreviations = React.useMemo(
    () => getFilteredUnitAbbreviations(unitsData, selectedArgUnit),
    [unitsData, selectedArgUnit]
  )

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
  const allMissionPaths = React.useMemo(
    () => (missionData?.list?.map((m) => m.path) ?? []).sort(sortMissionPaths),
    [missionData]
  )

  // Groups paths by folder prefix for the grouped dropdown headers.
  const missionGroupBy = missionGroupLabel

  // Extract unique mission base names from recent commands (set/load) for pinning.
  const recentMissionNames = React.useMemo(() => {
    const names = new Set<string>()
    recentCommandsData?.forEach((c) => {
      const cmd = c?.writtenCommand ?? ''
      // set missionname.param ... or set missionname:Section.param ...
      const setMatch = cmd.match(/^set\s+([-a-zA-Z0-9_]+)[.:]/i)
      if (setMatch) names.add(setMatch[1])
      // load path/missionname.tl/.xml/.py
      const loadMatch = cmd.match(
        /load\s+(?:\S+\/)?([-a-zA-Z0-9_]+)\.(tl|xml|py)/i
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

  // When amend parsed a paramPart using the '.' separator (root-arg format) but
  // the element only exists in an insert (e.g. 'MedianFilterLen' → 'Science.MedianFilterLen'),
  // the initial cumulative ID won't match any option in elementOptions. Once the
  // mission script loads, re-check and push the corrected ARG_VARIABLE so the
  // Element dropdown shows the right selection.
  useEffect(() => {
    const pending = pendingAmendRef.current
    if (!pending || elementOptions.length === 0) return
    const { missionPath, paramPart } = pending

    // Exact match → already correct, no correction needed.
    if (elementOptions.includes(paramPart)) {
      pendingAmendRef.current = null
      return
    }

    // Suffix match: paramPart is the bare name of an insert arg (e.g. 'MedianFilterLen'
    // matching 'Science.MedianFilterLen').
    const suffixMatch = elementOptions.find((o) => o.endsWith(`.${paramPart}`))
    if (suffixMatch) {
      const varTypeTier = `Variable Type${L_SEPARATOR}Mission`
      const missionTier = `Mission${L_SEPARATOR}${missionPath}`
      const elementTier = `Element${L_SEPARATOR}${suffixMatch}`
      const resolvedId = [varTypeTier, missionTier, elementTier].join(
        V_SEPARATOR
      )
      setVariable(mapValues(resolvedId))
      forceUpdateParamsRef.current?.({ ARG_VARIABLE: resolvedId })
    }

    pendingAmendRef.current = null
  }, [elementOptions])

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
      units={[
        {
          name: 'Units',
          options: filteredUnitAbbreviations,
          optionLabels: unitLabels,
        },
      ]}
      universals={[{ name: 'Universal', options: universalData ?? [] }]}
      missions={missionTypeOptions}
      decimationTypes={[{ name: 'Decimation Type', options: decimationTypes }]}
      serviceTypes={[{ name: 'Service Type', options: serviceTypes }]}
      variableTypes={variableTypes}
      showAdvanced={!hideAdvanced}
      onToggleAdvanced={() => setHideAdvanced((v) => !v)}
      onAmendCommand={handleAmendCommand}
      forceUpdateParamsRef={forceUpdateParamsRef}
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
