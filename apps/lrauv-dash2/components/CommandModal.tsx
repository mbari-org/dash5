import {
  CommandModalView,
  CommandModalViewProps,
  mapValues,
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
  useVehicleNames,
  useSbdOutgoingAlternativeAddresses,
  CreateCommandParams,
} from '@mbari/api-client'
import { makeCommand } from '../lib/makeCommand'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useState } from 'react'
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

  const [variable, setVariable] = useState<Record<string, string>>({
    Variable: '',
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
    toast.error(`Error sending command: ${error}`)
  }

  const sendCommand = (params: CreateCommandParams) => {
    createCommand(params, {
      onSuccess: onCommandSuccess,
      onError: onCommandError,
    })
  }

  // Network supplied data
  const { data: vehicles } = useVehicleNames({ refresh: 'n' })
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
  const { data: selectedMissionData } = useScript(
    {
      path: variable.Mission,
      gitRef: missionData?.gitRef ?? 'master',
    },
    { enabled: (variable.Mission ?? '') !== '' }
  )

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

  const units = unitsData?.map((u) => u.name) ?? []

  const commands =
    commandData?.commands.map((c) => ({
      id: c.keyword,
      name: c.keyword,
      description: c.description,
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
    const { schedDate } = makeCommand({
      commandText,
      scheduleMethod,
      specifiedLocalTime: specifiedTime,
    })

    sendCommand({
      vehicle: confirmedVehicle?.toLowerCase() ?? '',
      commandNote: notes ?? '',
      schedDate,
      destinationAddress: alternateAddress ?? undefined,
      commandText,
      via: commType,
      timeout,
    })
  }

  const syntaxVariations = commandData?.commands.find(
    (c) => c.keyword === currentCommandId
  )?.syntaxList

  const decimationTypes = commandData?.decimationTypes ?? []
  const serviceTypes = commandData?.serviceTypes ?? []

  const variableTypes = [
    { name: 'Variable', options: ['Mission', 'Universal', 'Component'] },
  ]
  switch (variable.Variable) {
    case 'Mission':
      variableTypes.push({
        name: 'Mission',
        options: missionData?.list?.map((m) => m.path) ?? [],
      })
      selectedMissionData?.scriptArgs &&
        variableTypes.push({
          name: 'Argument',
          options: selectedMissionData?.scriptArgs.map((a) => a.name) ?? [],
        })
      break
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

  const missionOptions = missionData?.list?.map((m) => m.path)?.sort() ?? []

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
      units={[{ name: 'Units', options: units }]}
      universals={[{ name: 'Universal', options: universalData ?? [] }]}
      missions={[
        {
          name: 'Mission',
          options: missionOptions,
        },
      ]}
      decimationTypes={[{ name: 'Decimation Type', options: decimationTypes }]}
      serviceTypes={[{ name: 'Service Type', options: serviceTypes }]}
      variableTypes={variableTypes}
      onUpdateField={handleUpdatedField}
      moduleNames={moduleNames}
      vehicles={vehicles}
      alternativeAddresses={alternativeAddresses ?? []}
      loading={sendingCommand}
      defaultCommand={defaultCommand ?? undefined}
    />
  )
}
