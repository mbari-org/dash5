import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { SelectOption } from '../Fields/Select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import { MissionTableProps } from '../Tables/MissionTable'
import { MissionStep } from './MissionModalSteps/MissionStep'
import { WaypointTableProps } from '../Tables/WaypointTable'
import { WaypointStep } from './MissionModalSteps/WaypointStep'
import { ExtraButton } from '../Modal/Footer'
import { WaypointSummary } from './MissionModalSteps/WaypointSummary'
import { ParameterStep } from './MissionModalSteps/ParameterStep'
import { ParameterProps, ParameterTableProps } from '../Tables/ParameterTable'
import { ParameterSummary } from './MissionModalSteps/ParameterSummary'
import { SafetyCommsStep } from './MissionModalSteps/SafetyCommsStep'
import { ReviewStep } from './MissionModalSteps/ReviewStep'
import { ScheduleMethod, CommType } from './MissionModalSteps/ScheduleStep'
import { ConfirmAndSendStep } from './MissionModalSteps/ConfirmAndSendStep'
import makeWaypointOverrides from './MissionModalSteps/helpers/makeWaypointOverrides'
import useManagedWaypoints from './MissionModalSteps/hooks/useManagedWaypoints'
import useManagedParameters from './MissionModalSteps/hooks/useManagedParameters'
import useMissionModalSteps from './MissionModalSteps/hooks/useMissionModalSteps'

import {
  ScheduleProvider,
  useScheduleContext,
  ScheduleState,
} from './MissionModalSteps/hooks/useSchedule'

export type OnScheduleMissionHandler = (args: {
  selectedMissionId: string
  parameterOverrides: ParameterProps[]
  alternateAddress?: string | null
  specifiedTime?: string | null
  notes?: string | null
  scheduleMethod: ScheduleMethod
  scheduleId?: string | null
  confirmedVehicle?: string | null
  preview?: boolean
  commType?: CommType
  timeout?: number
}) => void

export interface MissionModalViewProps
  extends Omit<StepProgressProps, 'steps'>,
    MissionTableProps,
    WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  missionCategories?: SelectOption[]
  totalDistance?: string
  bottomDepth?: string
  duration?: string
  unitOptions?: ParameterTableProps['unitOptions']
  parameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  unfilteredMissionParameters: ParameterProps[]
  defaultOverrides?: ParameterProps[]
  onRefreshStats?: () => void
  onSchedule?: OnScheduleMissionHandler
  onCancel?: () => void
  onVerifyParameter?: (param: string) => string
  alternativeAddresses?: string[]
  vehicles?: string[]
  previewText?: string
  /** Backend preview SBD fragment count (≥2 shown as a quiet note on Review). */
  previewSbdCount?: number
  loading?: boolean
  selectedMissionCategory?: string
  defaultSearchText?: string
  missionsLoading?: boolean
  onSelectMissionCategory?: (category?: string) => void
  showAllVehicleMissions?: boolean
  onShowAllVehicleMissions?: (show: boolean) => void
  /** Prefill Schedule step (e.g. via/timeout from a prior Send again). */
  initialScheduleState?: Partial<ScheduleState>
}

export const MissionModalView: React.FC<MissionModalViewProps> = (props) => (
  <ScheduleProvider
    initialState={{
      scheduleMethod: 'ASAP',
      alternateAddress: null,
      commType: 'cellsat',
      ...props.initialScheduleState,
    }}
  >
    <MissionModalBody {...props} />
  </ScheduleProvider>
)

const MissionModalBody: React.FC<MissionModalViewProps> = ({
  className,
  style,
  currentStepIndex,
  vehicleName,
  missions,
  missionCategories,
  selectedId,
  waypoints,
  stations,
  totalDistance,
  bottomDepth,
  duration,
  parameters,
  safetyParams,
  commsParams,
  onRefreshStats,
  onSchedule,
  onCancel,
  onVerifyParameter,
  onSelectMission: handleSelectMission,
  alternativeAddresses,
  unfilteredMissionParameters,
  vehicles,
  previewText,
  previewSbdCount,
  loading,
  unitOptions,
  selectedMissionCategory,
  defaultOverrides,
  defaultSearchText,
  missionsLoading,
  onSelectMissionCategory,
  showAllVehicleMissions,
  onShowAllVehicleMissions,
}) => {
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
  } = useScheduleContext()

  // Tracks whether the vehicle selection on Confirm & Send is complete.
  // False only while "No, send to:" is chosen with no vehicle picked yet.
  const [vehicleSelectionValid, setVehicleSelectionValid] = useState(true)

  const {
    handleParamUpdate,
    handleCommsUpdate,
    handleSafetyUpdate,
    updatedCommsParams,
    updatedSafetyParams,
    updatedParameters,
    overriddenMissionParams,
    safetyCommsParams,
    overrideCount,
    resetOverrides,
  } = useManagedParameters({
    parameters,
    safetyParams,
    commsParams,
    defaultOverrides,
    selectionKey: selectedId,
  })

  // Reset overrides when the mission category changes
  const handleSelectCategory = (category?: string) => {
    resetOverrides()
    onSelectMissionCategory?.(category)
  }

  const { steps, currentStep, handleNext, handlePrevious, showSummary } =
    useMissionModalSteps({
      initialIndex: currentStepIndex,
      waypoints,
      defaultParameters: parameters,
      updatedParameters,
      safetyParams,
      commsParams,
    })

  const {
    handleNaNwaypoints,
    handleResetWaypoints,
    handleWaypointsUpdate,
    updatedWaypoints,
    handleFocusWaypoint,
    plottedWaypointCount,
    plottedWaypoints,
    setWaypointsEditable,
    focusedWaypointIndex,
    editable,
  } = useManagedWaypoints(waypoints)

  // Only used in the default case (steps 0–4); Confirm & Send renders its own button.
  const confirmButtonText = (
    <div>
      <span className="pr-2">Next</span>{' '}
      <FontAwesomeIcon icon={faAnglesRight} />
    </div>
  )

  const missionName = missions.find(({ id }) => id === selectedId)?.name ?? ''

  const handleBack = () => {
    // When returning to the select mission step, clear mission selection and overrides
    if (!showSummary && currentStep === steps.indexOf('Mission') + 1) {
      handleSelectMission(null)
      resetOverrides()
    }
    handlePrevious()
  }

  const extraButtons = (): ExtraButton[] => {
    if (currentStep === 0) return []

    return [
      {
        buttonText: 'Back',
        appearance: 'secondary',
        onClick: handleBack,
      },
    ]
  }

  const disableConfirm = () => {
    switch (currentStep) {
      case steps.indexOf('Mission'):
        return !selectedId
      case steps.indexOf('Waypoints'):
        return (
          !updatedWaypoints.every(
            ({ lat, lon, latName, lonName }) =>
              (Number(lat) || lat === 'NaN') &&
              (Number(lon) || lon === 'NaN') &&
              latName &&
              lonName &&
              lat !== '' &&
              lon !== ''
          ) || focusedWaypointIndex != null
        )
      case steps.indexOf('Confirm & Send'):
        return (
          !vehicleSelectionValid ||
          !scheduleMethod ||
          (scheduleMethod === 'time' && !specifiedTime) ||
          (showAlternateAddress && !alternateAddress) ||
          ((commType === 'cell' || commType === 'cellsat') && !timeout)
        )
      default:
        return false
    }
  }

  const currentModalBody = () => {
    switch (currentStep) {
      case steps.indexOf('Mission'):
        return (
          <MissionStep
            vehicleName={vehicleName}
            missions={missions}
            selectedId={selectedId}
            missionCategories={missionCategories}
            onSelect={handleSelectMission}
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedMissionCategory}
            defaultSearchText={defaultSearchText}
            loading={missionsLoading}
            showAllVehicleMissions={showAllVehicleMissions}
            onShowAllVehicleMissions={onShowAllVehicleMissions}
          />
        )

      case steps.indexOf('Waypoints'):
        return showSummary ? (
          <WaypointSummary
            waypoints={updatedWaypoints}
            vehicleName={vehicleName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            mission={missionName}
          />
        ) : (
          <WaypointStep
            waypoints={updatedWaypoints}
            stations={stations}
            vehicleName={vehicleName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            mission={missionName}
            onRefreshStats={onRefreshStats}
            onUpdate={handleWaypointsUpdate}
            onNaNall={handleNaNwaypoints}
            onResetAll={handleResetWaypoints}
            onFocusWaypoint={handleFocusWaypoint}
            focusedWaypointIndex={focusedWaypointIndex}
          />
        )

      case steps.indexOf('Parameters'):
        return showSummary ? (
          <ParameterSummary
            vehicleName={vehicleName}
            mission={missionName}
            parameters={
              updatedParameters.filter((param) => param.overrideValue) || []
            }
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            onVerifyValue={onVerifyParameter}
            onParamUpdate={handleParamUpdate}
            unitOptions={unitOptions}
          />
        ) : (
          <ParameterStep
            vehicleName={vehicleName}
            mission={missionName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            parameters={updatedParameters || []}
            onVerifyValue={onVerifyParameter}
            onParamUpdate={handleParamUpdate}
            unitOptions={unitOptions}
          />
        )

      case steps.indexOf('Safety & Comms'):
        return (
          <SafetyCommsStep
            vehicleName={vehicleName}
            safetyParams={updatedSafetyParams}
            commsParams={updatedCommsParams}
            mission={missionName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            onSafetyUpdate={handleSafetyUpdate}
            onCommsUpdate={handleCommsUpdate}
            unitOptions={unitOptions}
          />
        )

      case steps.indexOf('Review'):
        return (
          <ReviewStep
            overriddenMissionParams={overriddenMissionParams || []}
            safetyCommsParams={safetyCommsParams || []}
            plottedWaypoints={plottedWaypoints}
            plottedWaypointCount={plottedWaypointCount}
            overrideCount={overrideCount}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
          />
        )

      default:
        return null
    }
  }

  const handleSchedule = () => {
    const preview = currentStep !== steps.indexOf('Confirm & Send')

    const waypointOverrides = makeWaypointOverrides(
      updatedWaypoints,
      unfilteredMissionParameters
    )

    onSchedule?.({
      selectedMissionId: selectedId as string,
      parameterOverrides: [
        waypointOverrides,
        overriddenMissionParams,
        safetyCommsParams.filter((p) => p.overrideValue),
      ].flat(),
      notes,
      specifiedTime,
      alternateAddress,
      scheduleId: customScheduleId,
      scheduleMethod,
      confirmedVehicle: confirmedVehicle ?? vehicleName,
      preview,
      commType,
      timeout,
    })

    preview && handleNext()
  }

  useEffect(() => {
    if (
      !editable &&
      currentStep === steps.indexOf('Waypoints') &&
      !showSummary
    ) {
      setWaypointsEditable(true)
    } else if (
      editable &&
      (showSummary || currentStep !== steps.indexOf('Waypoints'))
    ) {
      setWaypointsEditable(false)
    }
  }, [editable, setWaypointsEditable, currentStep, steps, showSummary])

  // Re-fetch preview whenever Confirm & Send becomes the active step, and whenever
  // scheduling state changes while on the step. This covers three cases:
  //   1. Normal flow (arriving from Review) — Review's Next fires one preview call;
  //      this effect fires a second. Both are identical, so the extra call is harmless.
  //   2. Send Again (opens directly at Confirm & Send with no prior Review step).
  //   3. Navigate back to change parameters, then return to Confirm & Send.
  // Ref holds the latest closure; deps are trigger conditions only.
  const confirmSendStepIndex = steps.indexOf('Confirm & Send')
  const isConfirmSendStep = currentStep === confirmSendStepIndex

  const triggerPreviewRef = useRef<(() => void) | null>(null)
  triggerPreviewRef.current = () => {
    if (!selectedId) return
    const waypointOverrides = makeWaypointOverrides(
      updatedWaypoints,
      unfilteredMissionParameters
    )
    onSchedule?.({
      selectedMissionId: selectedId as string,
      parameterOverrides: [
        waypointOverrides,
        overriddenMissionParams,
        safetyCommsParams.filter((p) => p.overrideValue),
      ].flat(),
      notes,
      specifiedTime,
      alternateAddress,
      scheduleId: customScheduleId,
      scheduleMethod,
      confirmedVehicle: confirmedVehicle ?? vehicleName,
      preview: true,
      commType,
      timeout,
    })
  }

  useEffect(() => {
    if (!isConfirmSendStep) return
    triggerPreviewRef.current?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    commType,
    timeout,
    scheduleMethod,
    specifiedTime,
    confirmedVehicle,
    isConfirmSendStep,
  ])

  // Fixed frame applied to every step — prevents short-content steps from shrinking
  // the modal and exposing the Schedule rows underneath for accidental clicks.
  const missionModalFrame = {
    className,
    style: {
      ...style,
      height: 'calc(100vh - 6rem)',
      minHeight: 'calc(100vh - 6rem)',
      maxHeight: 'calc(100vh - 6rem)',
    },
    snapTo: 'top-right' as const,
    extraWideModal: true,
    bodyOverflowHidden: true,
    open: true,
  }

  // On the Review step, clicking Next also kicks off the SBD preview fetch so
  // the preview is in-flight before Confirm & Send renders.
  const isReviewStep = steps[currentStep] === 'Review'
  const defaultConfirmHandler = isReviewStep ? handleSchedule : handleNext

  switch (currentStep) {
    case steps.indexOf('Confirm & Send'):
      return (
        <Modal
          {...missionModalFrame}
          allowPointerEventsOnChildren
          title={
            <StepProgress
              steps={steps}
              currentStepIndex={currentStep}
              className="h-[52px]"
            />
          }
          onConfirm={handleSchedule}
          onCancel={onCancel}
          onClose={onCancel}
          disableConfirm={disableConfirm()}
          loading={loading}
          confirmButtonText={`Send to ${confirmedVehicle ?? vehicleName}`}
          extraButtons={[
            {
              buttonText: 'Back',
              appearance: 'secondary',
              onClick: handleBack,
            },
          ]}
        >
          <ConfirmAndSendStep
            vehicleName={vehicleName}
            vehicleList={vehicles ?? []}
            commandText={missionName}
            waypointCount={plottedWaypointCount}
            overrideCount={overrideCount}
            previewText={previewText}
            previewSbdCount={previewSbdCount}
            alternativeAddresses={alternativeAddresses}
            onVehicleSelectionValidChange={setVehicleSelectionValid}
          />
        </Modal>
      )

    default:
      return (
        <Modal
          {...missionModalFrame}
          title={
            <StepProgress
              steps={steps}
              currentStepIndex={currentStep}
              className="h-[52px]"
            />
          }
          onConfirm={defaultConfirmHandler}
          disableConfirm={disableConfirm()}
          onCancel={onCancel}
          onClose={onCancel}
          confirmButtonText={confirmButtonText}
          extraButtons={extraButtons()}
        >
          {currentModalBody()}
        </Modal>
      )
  }
}
