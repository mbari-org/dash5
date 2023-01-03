import React, { useEffect, useState } from 'react'
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
  missionCategories?: SelectOption[]
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
  onSelectMission,
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
  const [selectedMissionCategory, setSelectedMissionCategory] = useState<
    string | undefined
  >('Recent Runs')
  const [selectedMissionId, setSelectedMissionId] = useState<
    string | null | undefined
  >(selectedId)

  const [showSummary, setShowSummary] = useState(false)
  const summarySteps = [1, 2]

  const [defaultWaypoints, setDefaultWaypoints] = useState<string>(
    JSON.stringify(waypoints)
  )
  const [updatedWaypoints, setUpdatedWaypoints] =
    useState<WaypointProps[]>(waypoints)
  const initialWaypoints = waypoints.map((waypoint) =>
    (waypoint.lat || waypoint.lon) && !waypoint.stationName
      ? { ...waypoint, stationName: 'Custom' }
      : waypoint
  )
  useEffect(() => {
    if (defaultWaypoints !== JSON.stringify(waypoints)) {
      setDefaultWaypoints(JSON.stringify(waypoints))
      setUpdatedWaypoints(initialWaypoints)
    }
  }, [waypoints, defaultWaypoints, setDefaultWaypoints, setUpdatedWaypoints])

  const handleWaypointsUpdate = (newWaypoints: WaypointProps[]) => {
    setUpdatedWaypoints(newWaypoints)
  }

  const [defaultParameters, setDefaultParameters] = useState<string>(
    JSON.stringify(parameters)
  )
  const [updatedParameters, setUpdatedParameters] =
    useState<ParameterProps[]>(parameters)
  const [updatedSafetyParams, setUpdatedSafetyParams] =
    useState<ParameterProps[]>(safetyParams)
  const [updatedCommsParams, setUpdatedCommsParams] =
    useState<ParameterProps[]>(commsParams)
  useEffect(() => {
    const paramString = JSON.stringify(parameters)
    if (defaultParameters !== paramString) {
      setDefaultParameters(paramString)
      setUpdatedParameters(parameters)
      setUpdatedSafetyParams(safetyParams)
      setUpdatedCommsParams(commsParams)
    }
  }, [
    parameters,
    defaultParameters,
    setDefaultParameters,
    setUpdatedParameters,
  ])

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
    const showStep1Summary = currentStep === 1
    const showStep2Summary =
      currentStep === 2 &&
      updatedParameters.some((param) => param.overrideValue)
    // Next button triggers an interstitial summary screen instead of moving to the next step if the step has one
    if (
      !showSummary &&
      summarySteps.includes(currentStep) &&
      (showStep1Summary || showStep2Summary)
    ) {
      setShowSummary(true)
      return
    }
    // showSummary flag is set back to false until next summary screen needs to be triggered
    showSummary && setShowSummary(false)
    const nextStep = currentStep + 1
    if (
      steps[nextStep].match(/waypoint/i) &&
      JSON.parse(defaultWaypoints).length === 0
    ) {
      return setCurrentStep(nextStep + 1)
    }
    return setCurrentStep(nextStep)
  }
  const handlePrevious = () => {
    // if the user is on a summary screen the Previous button will trigger the step associated with the summary, instead of moving back to the previous step (ie step 2 summary goes back to step 2 form, instead of back to step 1)
    if (showSummary) {
      setShowSummary(false)
      return
    }

    const prevStep = currentStep - 1
    if (
      steps[prevStep].match(/waypoint/i) &&
      JSON.parse(defaultWaypoints).length === 0
    ) {
      return setCurrentStep(prevStep - 1)
    }

    if (currentStep > 0) {
      return setCurrentStep(prevStep)
    }
  }

  const handleSchedule = () => {
    onSchedule?.()
  }

  const handleSelect = (id?: string | null) => {
    setSelectedMissionId(id)
    if (id) {
      onSelectMission?.(id)
    }
  }

  const handleSelectCategory = (category?: string) => {
    selectedMissionCategory !== category && setSelectedMissionCategory(category)
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

  const [focusedWaypointIndex, setFocusedWaypointIndex] = useState<
    number | null
  >(null)
  const handleFocusWaypoint: WaypointTableProps['onFocusWaypoint'] = (
    index
  ) => {
    setFocusedWaypointIndex(index)
  }

  const currentModalBody = () => {
    switch (currentStep) {
      case 0:
        return (
          <MissionStep
            vehicleName={vehicleName}
            missions={missions}
            selectedId={selectedMissionId}
            missionCategories={missionCategories}
            onSelect={handleSelect}
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedMissionCategory}
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
            onFocusWaypoint={handleFocusWaypoint}
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
