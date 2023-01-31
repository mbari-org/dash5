import {
  CommandModal as CommandModalView,
  CommandModalProps as CommandModalViewProps,
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
} from '@mbari/api-client'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useState } from 'react'

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
  const [currentCommandId, setCurrentCommand] = useState<
    string | null | undefined
  >()
  const [selectedMission, setSelectedMission] = useState<string | undefined>()
  const [configVariable, setConfigVariable] = useState<Record<string, string>>({
    Module: '',
    Component: '',
    Element: '',
  })
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

  const { data: unitsData } = useUnits()
  const { data: commandData } = useCommands()
  const { data: recentCommandsData } = useRecentCommands({
    vehicle: vehicleName,
  })
  const { data: frequentCommandsData } = useFrequentCommands({
    vehicle: vehicleName,
  })
  const { data: moduleInfoData } = useModuleInfo()
  const { data: universalData } = useUniversals({})
  const { data: missionData } = useMissionList()
  const { data: selectedMissionData } = useScript(
    {
      path: selectedMission ?? variable.Mission,
      gitRef: missionData?.gitRef ?? 'master',
    },
    { enabled: !!selectedMission || (variable.Mission ?? '') !== '' }
  )

  const handleUpdatedField: CommandModalViewProps['onUpdateField'] = (
    _param,
    argType,
    value
  ) => {
    if (argType === 'ARG_CONFIG_VARIABLE') {
      setConfigVariable(mapValues(value))
    }
    if (argType === 'ARG_VARIABLE') {
      setVariable(mapValues(value))
    }
  }

  const makeModuleNames = (config: { Module?: string; Component?: string }) => [
    { name: 'Module', options: moduleInfoData?.moduleNames ?? [] },
    {
      name: 'Component',
      options: configVariable.Module
        ? Object.keys(moduleInfoData?.outputUris[config.Module ?? ''] ?? {})
        : [],
    },
    {
      name: 'Element',
      options: config.Component
        ? moduleInfoData?.outputUris[config.Module ?? '']?.[
            config.Component
          ]?.map((e) => e.string) ?? []
        : [],
    },
  ]
  const moduleNames = makeModuleNames(configVariable)

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

  const handleSubmit: CommandModalViewProps['onSubmit'] = async () => {
    toast.success('Command sent!')
    onClose()
    return undefined
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

  return (
    <CommandModalView
      className={className}
      style={style}
      commands={commands}
      recentCommands={recentCommands}
      frequentCommands={frequentCommands}
      currentStepIndex={0}
      onSubmit={handleSubmit}
      onCancel={onClose}
      vehicleName={vehicleName}
      steps={steps}
      onSelectCommandId={setCurrentCommand}
      syntaxVariations={syntaxVariations ?? []}
      units={[{ name: 'Units', options: units }]}
      universals={[{ name: 'Universal', options: universalData ?? [] }]}
      decimationTypes={[{ name: 'Decimation Type', options: decimationTypes }]}
      serviceTypes={[{ name: 'Service Type', options: serviceTypes }]}
      variableTypes={variableTypes}
      onUpdateField={handleUpdatedField}
      moduleNames={moduleNames}
    />
  )
}
