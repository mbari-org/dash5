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
  onResetParameters?: () => void
  onSelectModule?: (module: string) => void
  onSelectOutputUri?: (outputUri: string) => void
  vehicles?: string[]
  /** Called when user clicks Amend Command; returns initial selectedParameters to pre-fill. */
  onAmendCommand?: (commandText: string) => Record<string, string>
  /**
   * Stable ref whose `.current` is wired by CommandModalBody to its internal
   * setSelectedParameters. CommandModal uses it to push a corrected
   * ARG_VARIABLE value after the mission script loads and the element can be
   * resolved to the correct insert-arg name (e.g. "Science.MedianFilterLen").
   */
  forceUpdateParamsRef?: React.MutableRefObject<
    ((params: Record<string, string>) => void) | null
  >
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
  onResetParameters: handleResetParameters,
  showAdvanced,
  onToggleAdvanced: handleToggleAdvanced,
  onAmendCommand: handleAmendCommandExternal,
  defaultCommand,
  forceUpdateParamsRef,
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

  // Wire forceUpdateParamsRef so CommandModal can push a corrected ARG_VARIABLE
  // after the mission script loads and the element name is resolved.
  useEffect(() => {
    if (!forceUpdateParamsRef) return
    forceUpdateParamsRef.current = (params) => {
      setSelectedParameters((prev) => ({ ...prev, ...params }))
    }
    return () => {
      forceUpdateParamsRef.current = null
    }
  }, [forceUpdateParamsRef])

  const handleTemplateParameterChange: BuildTemplatedCommandStepProps['onUpdateField'] =
    (param, argType, value) => {
      const lookup = argType === 'ARG_KEYWORD' ? param : argType
      setSelectedParameters((prev) => ({ ...prev, [lookup]: value }))
      handleUpdatedField?.(param, argType, value)
    }

  const handleReset = () => {
    setSelectedParameters({})
    setSelectedSyntax(null)
    handleResetParameters?.()
  }

  const handleAmendCommand = () => {
    const text = commandText ?? selectedCommandName ?? ''
    const keyword = text.trim().split(/\s+/)[0]?.toLowerCase()
    const matchingCommand = commands.find(
      (c) => c.id.toLowerCase() === keyword || c.name.toLowerCase() === keyword
    )
    if (matchingCommand) {
      // Parse and store initial params — applied after the reset useEffect fires
      const initialParams = handleAmendCommandExternal?.(text) ?? {}
      const hasParams = Object.keys(initialParams).length > 0
      // Use the canonical keyword (id) so the correct keyword is sent to the vehicle,
      // not a display alias such as 'failc' instead of 'failComponent'
      setSelectedCommandName(matchingCommand.id)
      setUseTemplateStep(true)
      onSelectCommandId?.(matchingCommand.id)
      if (matchingCommand.id === selectedCommandId) {
        // The [selectedCommandId] effect won't re-fire when the id is unchanged,
        // so apply params immediately and force a syntax re-select so the template
        // step rebuilds with the corrected args.
        setSelectedParameters(hasParams ? initialParams : {})
        pendingInitialParams.current = null
        skipNextSyntaxReset.current = hasParams
        // Force the [selectedCommandId] effect to re-run by briefly setting a
        // dummy id then restoring. Cancel any previous pending reset first so
        // rapid amend clicks don't queue multiple conflicting state updates.
        if (amendResetTimeoutRef.current != null) {
          clearTimeout(amendResetTimeoutRef.current)
        }
        setSelectedCommandId(matchingCommand.id + ' ')
        amendResetTimeoutRef.current = setTimeout(() => {
          amendResetTimeoutRef.current = null
          setSelectedCommandId(matchingCommand.id)
        }, 0)
      } else {
        pendingInitialParams.current = hasParams ? initialParams : null
        setSelectedCommandId(matchingCommand.id)
      }
    }
  }

  /* Reset params when command changes; apply pending amend params if present.
     skipNextSyntaxReset is set when a command changes so the first
     auto-selected syntax (from BuildTemplatedCommandStep mount) doesn't wipe
     the amend params that were just applied. Subsequent manual syntax switches
     by the user DO reset params as expected. */
  const pendingInitialParams = useRef<Record<string, string> | null>(null)
  const lastCommandId = useRef(selectedCommandId)
  const skipNextSyntaxReset = useRef(false)
  const amendResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  // Cancel any in-flight amend reset timer when the modal unmounts so we
  // don't trigger state updates on an unmounted component.
  useEffect(() => {
    return () => {
      if (amendResetTimeoutRef.current != null) {
        clearTimeout(amendResetTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedCommandId !== lastCommandId.current) {
      setSelectedParameters(pendingInitialParams.current ?? {})
      pendingInitialParams.current = null
      lastCommandId.current = selectedCommandId
      skipNextSyntaxReset.current = true
    }
  }, [selectedCommandId])

  useEffect(() => {
    if (!selectedSyntax) return
    if (skipNextSyntaxReset.current) {
      skipNextSyntaxReset.current = false
      return
    }
    setSelectedParameters({})
  }, [selectedSyntax])

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
      leftExtraButtons={
        currentStep === 1
          ? useTemplateStep
            ? [
                {
                  buttonText: 'Reset',
                  appearance: 'secondary',
                  onClick: handleReset,
                },
              ]
            : handleAmendCommandExternal
            ? [
                {
                  buttonText: 'Amend Command',
                  appearance: 'secondary',
                  onClick: handleAmendCommand,
                },
              ]
            : []
          : []
      }
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
          showAdvanced={showAdvanced}
          onToggleAdvanced={handleToggleAdvanced}
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
                options: commands.map((c) => c.id),
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
