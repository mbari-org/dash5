import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useStartDeployment, useTags } from '@mbari/api-client'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { NewDeploymentFormValues, NewDeploymentModal } from '@mbari/react-ui'
import { capitalize } from '@mbari/utils'
import useCurrentVehicle from '../lib/useCurrentVehicle'

export const NewDeployment: React.FC<{
  onClose?: () => void
}> = ({ onClose: handleClose }) => {
  const vehicle = useCurrentVehicle()
  const {
    mutate: startDeployment,
    isLoading,
    isError,
    isSuccess,
    error,
    data,
  } = useStartDeployment()
  const { data: tags } = useTags({ limit: 30 })
  const handleSubmit: AsyncSubmitHandler<NewDeploymentFormValues> = async (
    values
  ) => {
    await startDeployment({
      vehicle: vehicle as string,
      name: values.deploymentName ?? '',
      tag: values.gitTag ?? '',
      date: values.startTime ?? '',
    })
    return undefined
  }

  useEffect(() => {
    if (!isLoading && isError) {
      toast.error((error as Error)?.message ?? 'Could not send your note.')
    }
  }, [isLoading, isError, error])

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success(
        `Your note about ${capitalize(data.vehicle)} has been sent.`
      )
      handleClose?.()
    }
  }, [isLoading, isSuccess, data, handleClose])

  return (
    <NewDeploymentModal
      onSubmit={handleSubmit}
      loading={isLoading}
      onClose={handleClose}
      vehicleName={capitalize(vehicle ?? '')}
      tags={tags?.map(({ tag }) => ({ id: tag, name: tag })) ?? []}
      open
    />
  )
}
