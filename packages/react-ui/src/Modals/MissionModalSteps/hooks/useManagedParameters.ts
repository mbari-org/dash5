import { useState, useEffect } from 'react'
import {
  ParameterProps,
  ParameterTableProps,
} from '../../../Tables/ParameterTable'

const useManagedParameters = ({
  parameters,
  safetyParams,
  commsParams,
  defaultOverrides,
}: {
  parameters: ParameterProps[]
  safetyParams: ParameterProps[]
  commsParams: ParameterProps[]
  defaultOverrides?: ParameterProps[]
}) => {
  const [defaultParameters, setDefaultParameters] = useState<string>(
    JSON.stringify(parameters)
  )

  const mergeOverrides = (param: ParameterProps) => {
    const defaultOverride = defaultOverrides?.find(
      (override) => override.name === param.name
    )
    return {
      ...param,
      overrideValue: defaultOverride?.overrideValue,
      overrideUnit: defaultOverride?.overrideUnit,
    }
  }

  const [updatedParameters, setUpdatedParameters] = useState<ParameterProps[]>(
    parameters.map(mergeOverrides)
  )
  const [updatedSafetyParams, setUpdatedSafetyParams] = useState<
    ParameterProps[]
  >(safetyParams.map(mergeOverrides))
  const [updatedCommsParams, setUpdatedCommsParams] = useState<
    ParameterProps[]
  >(commsParams.map(mergeOverrides))
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
    overrideValue: string,
    overrideUnit?: string
  ) => {
    return params.map((param) =>
      param.name === name ? { ...param, overrideValue, overrideUnit } : param
    )
  }

  const handleParamUpdate: ParameterTableProps['onParamUpdate'] = (
    name: string,
    overrideValue: string,
    overrideUnit: string
  ) => {
    const newParameters = updateParams(
      updatedParameters,
      name,
      overrideValue,
      overrideUnit
    )
    setUpdatedParameters(newParameters)
  }

  const handleSafetyUpdate: ParameterTableProps['onParamUpdate'] = (
    name: string,
    newOverrideValue: string,
    overrideUnit: string
  ) => {
    const newSafetyParams = updateParams(
      updatedSafetyParams,
      name,
      newOverrideValue,
      overrideUnit
    )
    setUpdatedSafetyParams(newSafetyParams)
  }

  const handleCommsUpdate: ParameterTableProps['onParamUpdate'] = (
    name: string,
    newOverrideValue: string,
    overrideUnit: string
  ) => {
    const newCommsParams = updateParams(
      updatedCommsParams,
      name,
      newOverrideValue,
      overrideUnit
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
