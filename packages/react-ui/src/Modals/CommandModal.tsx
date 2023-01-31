import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'

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
import {
  ScheduleCommandForm,
  ScheduleCommandFormValues,
} from '../Forms/ScheduleCommandForm'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { ExtraButton } from '../Modal/Footer'

export interface CommandModalProps
  extends StepProgressProps,
    SelectCommandStepProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  onCancel?: () => void
  onSubmit: AsyncSubmitHandler<ScheduleCommandFormValues>
  onAltAddressSubmit?: AsyncSubmitHandler<ScheduleCommandFormValues>
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
}

export const CommandModal: React.FC<CommandModalProps> = ({
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
  onSubmit,
  onAltAddressSubmit,
  onMoreInfo: handleMoreInfo,
  onSelectCommandId,
  syntaxVariations,
  units,
  moduleNames,
  serviceTypes,
  variableTypes,
  missions,
  universals,
  decimationTypes,
  onUpdateField: handleUpdatedField,
}) => {
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)
  const [selectedCommandId, setSelectedCommandId] =
    useState<SelectCommandStepProps['selectedId']>(selectedId)
  const [currentStep, setCurrentStep] = useState(currentStepIndex ?? 0)
  const [selectedCommandName, setSelectedCommandName] = useState<
    string | null | undefined
  >(null)
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
    console.log('Handle Next', selectedCommandId)
    if (selectedCommandId) {
      return setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      return setCurrentStep(currentStep - 1)
    }
  }

  const getCommandNameById = (id: string) => {
    const selectedCommand = commands.find((command) => command.id === id)
    return selectedCommand?.name
  }

  const [shouldUseAltAddress, setShouldUseAltAddress] = useState(false)
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
        if (submitButtonRef.current) {
          setShouldUseAltAddress(true)
          submitButtonRef.current.click()
        }
      },
    }

    return isLastStep && onAltAddressSubmit
      ? [backButton, altAddressButton]
      : [backButton]
  }

  const handleScheduleSubmit: CommandModalProps['onSubmit'] = useCallback(
    async (values) => {
      if (shouldUseAltAddress) {
        setShouldUseAltAddress(false)
        return await onAltAddressSubmit?.(values)
      }
      return onSubmit(values)
    },
    [shouldUseAltAddress, onAltAddressSubmit, onSubmit]
  )

  // Templated Command State
  const [selectedSyntax, setSelectedSyntax] = useState<string | null>(null)
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

  return (
    <Modal
      className={className}
      style={style}
      title={
        <StepProgress
          steps={steps}
          currentStepIndex={currentStep}
          className="h-[52px] w-[512px]"
        />
      }
      onConfirm={isLastStep ? null : handleNext}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraButtons={extraButtons()}
      extraWideModal
      bodyOverflowHidden
      form={isLastStep ? 'scheduleCommandForm' : undefined}
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
          />
        ) : (
          <BuildFreeformCommandStep command={selectedCommandName ?? ''} />
        ))}
      {currentStep === 2 && selectedCommandId && (
        <ScheduleCommandForm
          vehicleName={vehicleName}
          command={getCommandNameById(selectedCommandId) ?? ''}
          onSubmit={handleScheduleSubmit}
          id="scheduleCommandForm"
          ref={submitButtonRef}
        />
      )}
    </Modal>
  )
}

CommandModal.displayName = 'Modals.CommandModal'
