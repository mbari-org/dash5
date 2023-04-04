import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'
import { ConfirmVehicleDialog } from './ConfirmVehicleDialog'

// Special reuse of MissionModalStep which is identical here.
import { ScheduleOption, ScheduleStep } from './MissionModalSteps/ScheduleStep'
import { AlternativeAddressStep } from './MissionModalSteps/AlternativeAddressStep'

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
  scheduleMethod?: ScheduleOption
  scheduleId?: string | null
  confirmedVehicle?: string | null
  preview?: boolean
}) => void

export interface CommandModalProps
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

export const CommandModal: React.FC<CommandModalProps> = ({
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
      <FontAwesomeIcon icon={faChevronDoubleRight} />
    </div>
  )

  const handleNext = () => {
    console.log('Handle Next', selectedCommandId, '->', currentStep + 1)
    if (selectedCommandId) {
      return setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (showAlternateAddress) {
      setAlternateAddress(null)
      setShowAlternateAddress(false)
      return
    }
    if (currentStep > 0) {
      return setCurrentStep(currentStep - 1)
    }
  }

  const getCommandNameById = (id: string) => {
    const selectedCommand = commands.find((command) => command.id === id)
    return selectedCommand?.name
  }

  // Schedule section details
  const [alternateAddress, setAlternateAddress] = useState<string | null>(null)
  const [confirmedVehicle, setConfirmedVehicle] = useState<string | null>(null)
  const [showAlternateAddress, setShowAlternateAddress] = useState(false)
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption | null>(
    'ASAP'
  )
  const [customScheduleId, setCustomScheduleId] = useState<string | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [specifiedTime, setSpecifiedTime] = useState<string | null>(null)

  const extraButtons = () => {
    if (currentStep === 0) return []

    const backButton: ExtraButton = {
      buttonText: 'Back',
      appearance: 'secondary',
      onClick: handlePrevious,
    }
    const altAddressButton: ExtraButton = {
      buttonText: 'Submit to alternative address',
      appearance: 'secondary',
      type: 'submit',
      onClick: () => {
        setShowAlternateAddress(true)
      },
    }

    return isLastStep && !!alternativeAddresses && !showAlternateAddress
      ? [backButton, altAddressButton]
      : [backButton]
  }

  // Command text state
  const [commandText, setCommandText] = useState<string | null>(null)

  // Templated Command State
  const [selectedSyntax, setSelectedSyntax] = useState<string | null>(
    syntaxVariations?.[0]?.help ?? null
  )
  const [selectedParameters, setSelectedParameters] = useState<{
    [key: string]: string
  }>({})
  const handleTemplateParameterChange: BuildTemplatedCommandStepProps['onUpdateField'] =
    (param, argType, value) => {
      const lookup = argType === 'ARG_KEYWORD' ? param : argType
      setSelectedParameters({ ...selectedParameters, [lookup]: value })
      handleUpdatedField?.(param, argType, value)
    }

  // Reset params when command or syntax changes
  const lastSyntax = useRef({ selectedSyntax, selectedCommandId })
  useEffect(() => {
    if (
      selectedCommandId !== lastSyntax.current.selectedCommandId ||
      selectedSyntax !== lastSyntax.current.selectedSyntax
    ) {
      setSelectedParameters({})
      lastSyntax.current = { selectedSyntax, selectedCommandId }
    }
  }, [selectedCommandId, selectedSyntax, setSelectedParameters])

  const handleSchedule = () => {
    onSchedule({
      commandText: commandText ?? '',
      specifiedTime,
      alternateAddress,
      scheduleId: customScheduleId,
      scheduleMethod: scheduleOption as ScheduleOption,
      confirmedVehicle: confirmedVehicle ?? vehicleName,
      notes,
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
        selectedCommandId &&
        (showAlternateAddress ? (
          <AlternativeAddressStep
            alternateAddress={alternateAddress}
            vehicleName={vehicleName}
            mission={commandText ?? getCommandNameById(selectedCommandId) ?? ''}
            commandDescriptor="command"
            alternativeAddresses={alternativeAddresses}
            onNotesChanged={setNotes}
            notes={notes}
            onAlternativeAddressChanged={setAlternateAddress}
          />
        ) : (
          <ScheduleStep
            vehicleName={vehicleName}
            commandText={
              commandText ?? getCommandNameById(selectedCommandId) ?? ''
            }
            commandDescriptor="command"
            scheduleId={customScheduleId}
            onScheduleIdChanged={setCustomScheduleId}
            scheduleMethod={scheduleOption}
            onScheduleMethodChanged={setScheduleOption}
            notes={notes}
            onNotesChanged={setNotes}
            specifiedTime={specifiedTime}
            onSpecifiedTimeChanged={setSpecifiedTime}
          />
        ))}
    </Modal>
  )
}

CommandModal.displayName = 'Modals.CommandModal'
