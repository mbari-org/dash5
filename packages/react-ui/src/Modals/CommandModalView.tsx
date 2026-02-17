import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { ConfirmVehicleDialog } from './ConfirmVehicleDialog'

import {
  ScheduleMethod,
  ScheduleStep,
  CommType,
} from './MissionModalSteps/ScheduleStep'
import { AlternativeAddressStep } from './MissionModalSteps/AlternativeAddressStep'

import {
  ScheduleProvider,
  useScheduleContext,
} from './MissionModalSteps/hooks/useSchedule'

import {
  SelectCommandStep,
  SelectCommandStepProps,
} from './CommandModalSteps/SelectCommandStep'
import { BuildFreeformCommandStep } from './CommandModalSteps/BuildFreeformCommandStep'
import {
  BuildTemplatedCommandStep,
  BuildTemplatedCommandStepProps,
  CommandSyntax,
} from './CommandModalSteps/BuildTemplatedCommandStep'
import { OptionSet, CommandDetailProps } from '../Tables/CommandDetailTable'
import { ExtraButton } from '../Modal/Footer'

export type OnScheduleCommandHandler = (args: {
  commandText: string
  alternateAddress?: string | null
  specifiedTime?: string | null
  notes?: string | null
  scheduleMethod?: ScheduleMethod
  scheduleId?: string | null
  confirmedVehicle?: string | null
  preview?: boolean
  commType?: CommType
  timeout?: number
}) => void

export interface CommandModalViewProps
  extends StepProgressProps,
    SelectCommandStepProps {
  loading?: boolean
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  onCancel?: () => void
  onSchedule: OnScheduleCommandHandler
  defaultCommand?: string
  alternativeAddresses?: string[]
  syntaxVariations?: CommandSyntax[]
  units?: OptionSet[]
  moduleNames?: OptionSet[]
  missions?: OptionSet[]
  decimationTypes?: OptionSet[]
  serviceTypes?: OptionSet[]
  variableTypes?: OptionSet[]
  universals?: OptionSet[]
  onUpdateField?: CommandDetailProps['onSelect']
  onSelectModule?: (module: string) => void
  onSelectOutputUri?: (outputUri: string) => void
  vehicles?: string[]
}

export const CommandModalView: React.FC<CommandModalViewProps> = (props) => (
  <ScheduleProvider
    initialState={{
      scheduleMethod: 'ASAP',
      alternateAddress: null,
      commType: 'cellsat',
    }}
  >
    <CommandModalBody {...props} />
  </ScheduleProvider>
)

const CommandModalBody: React.FC<CommandModalViewProps> = ({
  loading,
  className,
  style,
  steps,
  currentStepIndex,
  vehicleName,
  commands,
  recentCommands,
  frequentCommands,
  selectedId,
  onCancel,
  onSchedule,
  alternativeAddresses,
  onMoreInfo: handleMoreInfo,
  onSelectCommandId,
  syntaxVariations,
  units,
  moduleNames,
  serviceTypes,
  variableTypes,
  missions,
  vehicles,
  universals,
  decimationTypes,
  onUpdateField: handleUpdatedField,
  defaultCommand,
}) => {
  const [selectedCommandId, setSelectedCommandId] =
    useState<SelectCommandStepProps['selectedId']>(selectedId)

  const [currentStep, setCurrentStep] = useState(currentStepIndex ?? 0)
  const [selectedCommandName, setSelectedCommandName] = useState<
    string | null | undefined
  >(defaultCommand)
  const [useTemplateStep, setUseTemplateStep] = useState(false)

  const {
    state: {
      alternateAddress,
      confirmedVehicle,
      showAlternateAddress,
      scheduleMethod,
      customScheduleId,
      notes,
      specifiedTime,
      commType,
      timeout,
    },
    actions: {
      setAlternateAddress,
      setConfirmedVehicle,
      setShowAlternateAddress,
    },
  } = useScheduleContext()

  const handleSelectCommandId: SelectCommandStepProps['onSelectCommandId'] = (
    id,
    name,
    isTemplate
  ) => {
    setSelectedCommandId(id ?? undefined)
    setSelectedCommandName(name)
    setUseTemplateStep(isTemplate ?? false)
    onSelectCommandId?.(id)
  }

  const isLastStep = currentStep === steps.length - 1
  const confirmButtonText = isLastStep ? (
    `Schedule ${vehicleName}`
  ) : (
    <div>
      <span className="pr-2">Next</span>{' '}
      <FontAwesomeIcon icon={faAnglesRight} />
    </div>
  )

  const handleNext = () => {
    // Allow advancing if:
    // 1. selectedCommandId is set (templated commands)
    // 2. OR we're on step 1 and have commandText or selectedCommandName (freeform commands)
    if (
      selectedCommandId ||
      (currentStep === 1 && (commandText || selectedCommandName))
    ) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (showAlternateAddress) {
      setAlternateAddress(null)
      setShowAlternateAddress(false)
      return
    }
    currentStep > 0 && setCurrentStep(currentStep - 1)
  }

  const getCommandNameById = (id: string) =>
    commands.find((c) => c.id === id)?.name

  const extraButtons = (): ExtraButton[] => {
    if (currentStep === 0) return []

    const back: ExtraButton = {
      buttonText: 'Back',
      appearance: 'secondary',
      onClick: handlePrevious,
    }

    const alt: ExtraButton = {
      buttonText: 'Submit to alternative address',
      appearance: 'secondary',
      type: 'submit',
      onClick: () => setShowAlternateAddress(true),
    }

    return isLastStep && alternativeAddresses && !showAlternateAddress
      ? [back, alt]
      : [back]
  }

  const [commandText, setCommandText] = useState<string | null>(
    defaultCommand ?? null
  )

  const [selectedSyntax, setSelectedSyntax] = useState<string | null>(
    syntaxVariations?.[0]?.help ?? null
  )
  const [selectedParameters, setSelectedParameters] = useState<{
    [key: string]: string
  }>({})

  const handleTemplateParameterChange: BuildTemplatedCommandStepProps['onUpdateField'] =
    (param, argType, value) => {
      const lookup = argType === 'ARG_KEYWORD' ? param : argType
      setSelectedParameters((prev) => ({ ...prev, [lookup]: value }))
      handleUpdatedField?.(param, argType, value)
    }

  /* Reset params when command or syntax changes */
  const lastSyntax = useRef({ selectedSyntax, selectedCommandId })
  useEffect(() => {
    if (
      selectedCommandId !== lastSyntax.current.selectedCommandId ||
      selectedSyntax !== lastSyntax.current.selectedSyntax
    ) {
      setSelectedParameters({})
      lastSyntax.current = { selectedSyntax, selectedCommandId }
    }
  }, [selectedCommandId, selectedSyntax])

  const handleSchedule = () => {
    onSchedule({
      commandText: commandText ?? '',
      specifiedTime,
      alternateAddress,
      scheduleId: customScheduleId,
      scheduleMethod,
      confirmedVehicle: confirmedVehicle ?? vehicleName,
      notes,
      commType,
      timeout,
    })
  }

  return currentStep === 3 ? (
    <ConfirmVehicleDialog
      loading={loading}
      vehicle={vehicleName}
      vehicleList={vehicles ?? [vehicleName]}
      command={commandText ?? ''}
      onChangeVehicle={setConfirmedVehicle}
      onCancel={handlePrevious}
      onConfirm={handleSchedule}
    />
  ) : (
    <Modal
      loading={loading}
      className={className}
      style={style}
      title={
        <StepProgress
          steps={steps}
          currentStepIndex={currentStep}
          className="h-[52px] w-[512px]"
        />
      }
      onConfirm={handleNext}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraButtons={extraButtons()}
      extraWideModal
      bodyOverflowHidden
      snapTo="top-right"
      open
    >
      {currentStep === 0 && (
        <SelectCommandStep
          selectedId={selectedCommandId}
          commands={commands}
          recentCommands={recentCommands}
          frequentCommands={frequentCommands}
          onSelectCommandId={handleSelectCommandId}
          onMoreInfo={handleMoreInfo}
          vehicleName={vehicleName}
        />
      )}

      {currentStep === 1 &&
        (useTemplateStep ? (
          <BuildTemplatedCommandStep
            selectedCommandName={selectedCommandName ?? 'unknown command'}
            syntaxVariations={syntaxVariations}
            units={units}
            moduleNames={moduleNames}
            onUpdateField={handleTemplateParameterChange}
            selectedSyntax={selectedSyntax}
            onSelectSyntax={setSelectedSyntax}
            selectedParameters={selectedParameters}
            serviceTypes={serviceTypes}
            variableTypes={variableTypes}
            missions={missions}
            universals={universals}
            decimationTypes={decimationTypes}
            commands={[
              {
                name: 'Command',
                options: commands.map((c) => c.name),
              },
            ]}
            onCommandTextChange={setCommandText}
          />
        ) : (
          <BuildFreeformCommandStep
            command={commandText ?? selectedCommandName ?? ''}
            onCommandTextChange={setCommandText}
          />
        ))}

      {currentStep === 2 &&
        (selectedCommandId || commandText || selectedCommandName) &&
        (showAlternateAddress ? (
          <AlternativeAddressStep
            vehicleName={vehicleName}
            mission={
              commandText ??
              getCommandNameById(selectedCommandId ?? '') ??
              selectedCommandName ??
              ''
            }
            commandDescriptor="command"
            alternativeAddresses={alternativeAddresses}
          />
        ) : (
          <ScheduleStep
            vehicleName={vehicleName}
            commandText={
              commandText ??
              getCommandNameById(selectedCommandId ?? '') ??
              selectedCommandName ??
              ''
            }
            commandDescriptor="command"
          />
        ))}
    </Modal>
  )
}

CommandModalView.displayName = 'Modals.CommandModalView'
