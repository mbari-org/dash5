/* MissionModalView.tsx
   — Refactored to use the new stand‑alone <ScheduleProvider> and useScheduleContext()
*/

import React, { useEffect, useState } from 'react'
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
import {
  ScheduleMethod,
  ScheduleStep,
  CommType,
} from './MissionModalSteps/ScheduleStep'
import { AlternativeAddressStep } from './MissionModalSteps/AlternativeAddressStep'
import makeWaypointOverrides from './MissionModalSteps/helpers/makeWaypointOverrides'
import useManagedWaypoints from './MissionModalSteps/hooks/useManagedWaypoints'
import useManagedParameters from './MissionModalSteps/hooks/useManagedParameters'
import useMissionModalSteps from './MissionModalSteps/hooks/useMissionModalSteps'
import { ConfirmVehicleDialog } from './ConfirmVehicleDialog'

import {
  ScheduleProvider,
  useScheduleContext,
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
  commandText?: string
  loading?: boolean
  onStepIndexChange?: (step: number) => void
  selectedMissionCategory?: string
  defaultSearchText?: string
  missionsLoading?: boolean
  onSelectMissionCategory?: (category?: string) => void
}

export const MissionModalView: React.FC<MissionModalViewProps> = (props) => (
  <ScheduleProvider
    initialState={{
      scheduleMethod: 'ASAP',
      alternateAddress: null,
      commType: 'cellsat',
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
  commandText,
  loading,
  unitOptions,
  selectedMissionCategory,
  defaultOverrides,
  defaultSearchText,
  missionsLoading,
  onSelectMissionCategory: handleSelectCategory,
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
    actions: {
      setAlternateAddress,
      setConfirmedVehicle,
      setShowAlternateAddress,
    },
  } = useScheduleContext()

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
  })

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

  const isLastStep = currentStep === steps.length - 1
  const confirmButtonText = isLastStep ? (
    `Schedule ${vehicleName}`
  ) : (
    <div>
      <span className="pr-2">Next</span>{' '}
      <FontAwesomeIcon icon={faAnglesRight} />
    </div>
  )

  const missionName = missions.find(({ id }) => id === selectedId)?.name ?? ''

  const handleAlternateAddress = () => setShowAlternateAddress(true)

  const handleBack = () => {
    if (showAlternateAddress) {
      setShowAlternateAddress(false)
      setAlternateAddress(null)
    }
    // When returning to the select mission step, clear mission selection and overrides
    if (currentStep === steps.indexOf('Mission') + 1) {
      handleSelectMission(null)
      resetOverrides()
    }
    handlePrevious()
  }

  const extraButtons = (): ExtraButton[] => {
    if (currentStep === 0) return []

    const buttons: ExtraButton[] = [
      {
        buttonText: 'Back',
        appearance: 'secondary',
        onClick: handleBack,
      },
    ]

    if (steps[currentStep] === 'Schedule' && !showAlternateAddress) {
      buttons.push({
        buttonText: 'Send to alternate address',
        appearance: 'secondary',
        onClick: handleAlternateAddress,
        disabled: disableConfirm(),
      })
    }
    return buttons
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
          ) || !!focusedWaypointIndex
        )
      case steps.indexOf('Schedule'):
        return (
          !scheduleMethod ||
          (scheduleMethod === 'time' && !specifiedTime) ||
          (showAlternateAddress && !alternateAddress)
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

      case steps.indexOf('Schedule'):
        return showAlternateAddress ? (
          <AlternativeAddressStep
            vehicleName={vehicleName}
            mission={missionName}
            alternativeAddresses={alternativeAddresses}
          />
        ) : (
          <ScheduleStep
            waypointCount={plottedWaypointCount}
            overrideCount={overrideCount}
            vehicleName={vehicleName}
            commandText={missionName}
          />
        )

      default:
        return null
    }
  }

  const handleSchedule = () => {
    const preview = currentStep !== steps.indexOf('Send Command')

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

  switch (currentStep) {
    case steps.indexOf('Confirm'):
      return (
        <ConfirmVehicleDialog
          vehicle={vehicleName}
          vehicleList={vehicles ?? []}
          mission={selectedId ?? ''}
          onChangeVehicle={setConfirmedVehicle}
          onCancel={handlePrevious}
          onConfirm={handleSchedule}
        />
      )

    case steps.indexOf('Send Command'):
      return (
        <Modal
          title="Review and Send Command"
          onConfirm={handleSchedule}
          onCancel={handlePrevious}
          loading={loading}
          open
          extraWideModal
        >
          <div className="flex flex-col">
            <p className="mb-2">
              The following command will be sent to{' '}
              <span className="text-teal-500">
                {confirmedVehicle ?? vehicleName}
              </span>
              :
            </p>
            <pre className="w-full rounded-lg bg-stone-100 p-4 font-mono">
              {commandText?.split(';').join(';\n')}
            </pre>

            {notes && (
              <>
                <p className="my-2">Additional notes:</p>
                <pre className="w-full rounded-lg bg-stone-100 p-4 font-mono">
                  {notes}
                </pre>
              </>
            )}
          </div>
        </Modal>
      )

    default:
      return (
        <Modal
          className={className}
          style={style}
          title={
            <StepProgress
              steps={steps.slice(0, steps.length - 1)}
              currentStepIndex={currentStep}
              className="h-[52px]"
            />
          }
          onConfirm={handleNext}
          disableConfirm={disableConfirm()}
          onCancel={onCancel}
          confirmButtonText={confirmButtonText}
          extraButtons={extraButtons()}
          snapTo="top-right"
          extraWideModal
          bodyOverflowHidden
          allowPointerEventsOnChildren
          open
        >
          {currentModalBody()}
        </Modal>
      )
  }
}
