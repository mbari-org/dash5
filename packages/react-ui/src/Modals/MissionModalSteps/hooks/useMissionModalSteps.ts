import { useState, useEffect } from 'react'
import { ParameterProps } from '../../../Tables/ParameterTable'
import { WaypointProps } from '../../../Tables/WaypointTable'

const steps = [
  'Mission',
  'Waypoints',
  'Parameters',
  'Safety & Comms',
  'Review',
  'Schedule',
  'Confirm',
]

export interface UseMissionModalStepsProps {
  initialIndex: number
  defaultParameters: ParameterProps[]
  updatedParameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  waypoints: WaypointProps[]
}

const useMissionModalSteps = ({
  initialIndex,
  defaultParameters,
  updatedParameters,
  safetyParams,
  commsParams,
  waypoints,
}: UseMissionModalStepsProps) => {
  const [currentStep, setCurrentStep] = useState(initialIndex)
  const [showSummary, setShowSummary] = useState(false)
  const summarySteps = [steps.indexOf('Waypoints'), steps.indexOf('Parameters')]

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
    let nextStep = currentStep + 1
    if (steps[nextStep].match(/waypoint/i) && waypoints.length === 0) {
      nextStep = nextStep + 1
    }
    if (
      steps[nextStep].match(/parameters/i) &&
      defaultParameters.length === 0
    ) {
      nextStep = nextStep + 1
    }
    if (
      steps[nextStep].match(/safety/i) &&
      safetyParams.length === 0 &&
      commsParams.length === 0
    ) {
      nextStep = nextStep + 1
    }
    return setCurrentStep(nextStep)
  }

  const handlePrevious = () => {
    // if the user is on a summary screen the Previous button will trigger the step associated with the summary, instead of moving back to the previous step (ie step 2 summary goes back to step 2 form, instead of back to step 1)
    if (showSummary) {
      setShowSummary(false)
      return
    }

    let prevStep = currentStep - 1
    if (
      steps[prevStep].match(/safety/i) &&
      safetyParams.length === 0 &&
      commsParams.length === 0
    ) {
      prevStep = prevStep - 1
    }
    if (
      steps[prevStep].match(/parameters/i) &&
      defaultParameters.length === 0
    ) {
      prevStep = prevStep - 1
    }
    if (steps[prevStep].match(/waypoint/i) && waypoints.length === 0) {
      prevStep = prevStep - 1
    }

    if (prevStep >= 0) {
      return setCurrentStep(prevStep)
    }
  }

  return {
    steps,
    handleNext,
    handlePrevious,
    currentStep,
    setCurrentStep,
    showSummary,
    setShowSummary,
  }
}

export default useMissionModalSteps
