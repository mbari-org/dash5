import React, { useState } from 'react'
import { Modal } from '../Modal/Modal'
import { StepProgress, StepProgressProps } from '../Navigation/StepProgress'
import { SelectOption } from '../Fields/Select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDoubleRight } from '@fortawesome/pro-solid-svg-icons'
import { MissionTableProps } from '../Tables/MissionTable'
import { MissionStep } from './MissionModalSteps/MissionStep'
import { WaypointProps, WaypointTableProps } from '../Tables/WaypointTable'
import { WaypointStep } from './MissionModalSteps/WaypointStep'
import { ExtraButton } from '../Modal/Footer'
import { WaypointSummary } from './MissionModalSteps/WaypointSummary'
import { ParameterStep } from './MissionModalSteps/ParameterStep'
import { ParameterProps } from '../Tables/ParameterTable'
import { ParameterSummary } from './MissionModalSteps/ParameterSummary'
import { SafetyCommsStep } from './MissionModalSteps/SafetyCommsStep'
import { ReviewStep } from './MissionModalSteps/ReviewStep'

export interface MissionModalProps
  extends Omit<StepProgressProps, 'steps'>,
    MissionTableProps,
    WaypointTableProps {
  className?: string
  style?: React.CSSProperties
  vehicleName: string
  recentRuns?: SelectOption[]
  totalDistance?: string
  bottomDepth?: string
  duration?: string
  parameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  onRefreshStats?: () => void
  onSchedule?: () => void
  onCancel?: () => void
  onVerifyParameter?: (param: string) => string
}

export const MissionModal: React.FC<MissionModalProps> = ({
  className,
  style,
  currentIndex,
  vehicleName,
  missions,
  recentRuns,
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
}) => {
  const steps = [
    'Mission',
    'Waypoints',
    'Parameters',
    'Safety & Comms',
    'Review',
    'Schedule',
  ]

  const [currentStep, setCurrentStep] = useState(currentIndex)
  const [selectedMissionId, setSelectedMissionId] =
    useState<string | null | undefined>(selectedId)

  const [showSummary, setShowSummary] = useState(false)
  const summarySteps = [1, 2]

  const initialWaypoints = waypoints.map((waypoint) =>
    (waypoint.lat || waypoint.lon) && !waypoint.stationName
      ? { ...waypoint, stationName: 'Custom' }
      : waypoint
  )

  const [updatedWaypoints, setUpdatedWaypoints] =
    useState<WaypointProps[]>(initialWaypoints)

  const handleWaypointsUpdate = (newWaypoints: WaypointProps[]) => {
    setUpdatedWaypoints(newWaypoints)
  }

  const [updatedParameters, setUpdatedParameters] =
    useState<ParameterProps[]>(parameters)
  const [updatedSafetyParams, setUpdatedSafetyParams] =
    useState<ParameterProps[]>(safetyParams)
  const [updatedCommsParams, setUpdatedCommsParams] =
    useState<ParameterProps[]>(commsParams)

  const updateParams = (
    params: ParameterProps[],
    name: string,
    newOverrideValue: string
  ) => {
    return params.map((param) =>
      param.name === name
        ? { ...param, overrideValue: newOverrideValue }
        : param
    )
  }

  const handleParamUpdate = (name: string, newOverrideValue: string) => {
    const newParameters = updateParams(
      updatedParameters,
      name,
      newOverrideValue
    )
    setUpdatedParameters(newParameters)
  }

  const handleSafetyUpdate = (name: string, newOverrideValue: string) => {
    const newSafetyParams = updateParams(
      updatedSafetyParams,
      name,
      newOverrideValue
    )
    setUpdatedSafetyParams(newSafetyParams)
  }

  const handleCommsUpdate = (name: string, newOverrideValue: string) => {
    const newCommsParams = updateParams(
      updatedCommsParams,
      name,
      newOverrideValue
    )
    setUpdatedCommsParams(newCommsParams)
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
    // Next button triggers an interstitial summary screen instead of moving to the next step if the step has one
    if (summarySteps.includes(currentStep) && !showSummary) {
      setShowSummary(true)
      return
    }
    // showSummary flag is set back to false until next summary screen needs to be triggered
    showSummary && setShowSummary(false)

    return setCurrentStep(currentStep + 1)
  }
  const handlePrevious = () => {
    // if the user is on a summary screen the Previous button will trigger the step associated with the summary, instead of moving back to the previous step (ie step 2 summary goes back to step 2 form, instead of back to step 1)
    if (showSummary) {
      setShowSummary(false)
      return
    }

    if (currentStep > 0) {
      return setCurrentStep(currentStep - 1)
    }
  }

  const handleSchedule = () => {
    onSchedule?.()
  }

  const handleSelect = (id?: string | null) => {
    setSelectedMissionId(id)
  }

  const getMissionName = () => {
    const selectedMission = missions.find(({ id }) => id === selectedMissionId)

    return selectedMission?.name ?? ''
  }

  const extraButtons = () => {
    if (currentStep === 0) return []

    const backButton: ExtraButton = {
      buttonText: 'Back',
      appearance: 'secondary',
      onClick: handlePrevious,
    }
    return [backButton]
  }

  const disableConfirm = () => {
    switch (currentStep) {
      case 0:
        return !selectedMissionId
      case 1:
        return !updatedWaypoints.every(
          ({ lat, lon, latName, lonName }) =>
            (Number(lat) || lat === 'NaN') &&
            (Number(lon) || lon === 'NaN') &&
            latName &&
            lonName &&
            lat !== '' &&
            lon !== ''
        )
      default:
        false
    }
  }

  const handleNaNwaypoints = () => {
    const allNaNwaypoints = updatedWaypoints.map((waypoint) => ({
      ...waypoint,
      lat: 'NaN',
      lon: 'NaN',
      stationName: 'Custom',
    }))
    setUpdatedWaypoints(allNaNwaypoints)
  }
  const handleResetWaypoints = () => {
    setUpdatedWaypoints(initialWaypoints)
  }

  const currentModalBody = () => {
    switch (currentStep) {
      case 0:
        return (
          <MissionStep
            vehicleName={vehicleName}
            missions={missions}
            selectedId={selectedMissionId}
            recentRuns={recentRuns}
            onSelect={handleSelect}
          />
        )
      case 1:
        return showSummary ? (
          <WaypointSummary
            waypoints={updatedWaypoints}
            vehicleName={vehicleName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            mission={getMissionName()}
          />
        ) : (
          <WaypointStep
            waypoints={updatedWaypoints}
            stations={stations}
            vehicleName={vehicleName}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            mission={getMissionName()}
            onRefreshStats={onRefreshStats}
            onUpdate={handleWaypointsUpdate}
            onNaNall={handleNaNwaypoints}
            onResetAll={handleResetWaypoints}
          />
        )

      case 2:
        return showSummary ? (
          <ParameterSummary
            vehicleName={vehicleName}
            mission={getMissionName()}
            parameters={
              updatedParameters.filter((param) => param.overrideValue) || []
            }
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            onVerifyValue={onVerifyParameter}
            onParamUpdate={handleParamUpdate}
          />
        ) : (
          <ParameterStep
            vehicleName={vehicleName}
            mission={getMissionName()}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            parameters={updatedParameters || []}
            onVerifyValue={onVerifyParameter}
            onParamUpdate={handleParamUpdate}
          />
        )

      case 3:
        return (
          <SafetyCommsStep
            vehicleName={vehicleName}
            safetyParams={updatedSafetyParams}
            commsParams={updatedCommsParams}
            mission={getMissionName()}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
            onSafetyUpdate={handleSafetyUpdate}
            onCommsUpdate={handleCommsUpdate}
          />
        )

      case 4:
        return (
          <ReviewStep
            parameters={updatedParameters || []}
            safetyCommsParams={updatedSafetyParams.concat(updatedCommsParams)}
            waypoints={updatedWaypoints}
            totalDistance={totalDistance}
            bottomDepth={bottomDepth}
            duration={duration}
          />
        )

      default:
        return <p>Placeholder for {steps[currentStep]} step</p>
    }
  }

  return (
    <Modal
      className={className}
      style={style}
      title={
        <StepProgress
          steps={steps}
          currentIndex={currentStep}
          className="h-[52px] w-[742px]"
        />
      }
      onConfirm={isLastStep ? handleSchedule : handleNext}
      disableConfirm={disableConfirm()}
      onCancel={onCancel}
      confirmButtonText={confirmButtonText}
      extraButtons={extraButtons()}
      extraWideModal
      bodyOverflowHidden
      open
    >
      {currentModalBody()}
    </Modal>
  )
}
