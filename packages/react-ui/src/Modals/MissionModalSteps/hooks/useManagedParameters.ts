import { useState, useEffect } from 'react'
import { ParameterProps } from '../../../Tables/ParameterTable'

const useManagedParameters = ({
  parameters,
  safetyParams,
  commsParams,
}: {
  parameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
}) => {
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

  const safetyCommsParams = updatedSafetyParams.concat(updatedCommsParams)
  const overriddenMissionParams = updatedParameters.filter(
    (param) => param.overrideValue
  )
  const overrideCount =
    safetyCommsParams.filter((param) => param.overrideValue)?.length +
      overriddenMissionParams?.length ?? 0

  return {
    handleCommsUpdate,
    handleParamUpdate,
    handleSafetyUpdate,
    safetyCommsParams,
    updatedCommsParams,
    updatedParameters,
    updatedSafetyParams,
    overrideCount,
    overriddenMissionParams,
  }
}

export default useManagedParameters
