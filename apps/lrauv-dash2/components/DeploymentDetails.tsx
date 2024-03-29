import { useEffect } from 'react'
import {
  useTags,
  useUpdateDeployment,
  useAlterDeployment,
} from '@mbari/api-client'
import {
  DeploymentDetailsPopUp,
  EventType,
  DeploymentDetails,
} from '@mbari/react-ui'
import { DateTime } from 'luxon'
import useCurrentDeployment from '../lib/useCurrentDeployment'
import toast from 'react-hot-toast'

const useAlterDeploymentWithEffects = (onSuccess?: () => void) => {
  const {
    mutate: alterDeployment,
    data,
    isLoading,
    error,
    isError,
    isSuccess,
  } = useAlterDeployment()
  useEffect(() => {
    if (!isLoading && isError) {
      toast.error((error as Error)?.message ?? 'Could not update deployment.')
    }
  }, [isLoading, isError, error])

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success(`Deployment has been updated.`)
      onSuccess?.()
    }
  }, [isLoading, isSuccess, data, onSuccess])
  return alterDeployment
}

const DeploymentDetails: React.FC<{
  onClose?: () => void
}> = ({ onClose: handleClose }) => {
  const { deployment } = useCurrentDeployment()
  const { mutate: updateDeployment } = useUpdateDeployment()
  const alterDeployment = useAlterDeploymentWithEffects()

  const { data: tags } = useTags({ limit: 30 })
  const getISODate = (time?: number) =>
    time ? DateTime.fromMillis(time).toISO() : undefined

  const contents = deployment?.dlistResult?.contents?.split('\n')
  const directoryIndex = contents?.findIndex(
    (line) => line.indexOf('set of logs') > -1
  )
  const logFiles = directoryIndex
    ? contents?.filter((_, i) => i > directoryIndex)
    : []
  const handleSaveGitTag = (gitTag: string) => {
    if (deployment?.deploymentId) {
      updateDeployment({
        deploymentId: deployment.deploymentId as number,
        tag: gitTag,
      })
    }
  }

  const handleSaveDeployment = ({
    startDate,
    endDate,
    launchDate,
    recoverDate,
  }: DeploymentDetails) => {
    if (deployment?.deploymentId) {
      updateDeployment({
        deploymentId: deployment.deploymentId as number,
        startDate,
        endDate,
        launchDate,
        recoverDate,
      })
    }
  }

  const handleSetDeploymentTime = (event: EventType) => {
    let note = ''
    switch (event) {
      case 'launch':
        note = 'Vehicle in water'
        break
      case 'recover':
        note = 'Vehicle recovered'
        break
      default:
        note = ''
    }
    if (deployment?.deploymentId) {
      alterDeployment({
        deploymentId: deployment.deploymentId as number,
        date: DateTime.now().toISO(),
        deploymentType: event as 'launch' | 'recover' | 'end',
        note,
      })
    }
  }

  return (
    <DeploymentDetailsPopUp
      onClose={handleClose}
      name={deployment?.name ?? ''}
      complete={!!deployment?.endEvent}
      tagOptions={tags?.map(({ tag }) => ({ id: tag, name: tag })) ?? []}
      queueSize={0}
      gitTag={deployment?.path ?? ''}
      logFiles={logFiles}
      directoryListFilepath={deployment?.dlistResult?.path}
      startDate={getISODate(deployment?.startEvent?.unixTime)}
      launchDate={getISODate(deployment?.launchEvent?.unixTime)}
      recoverDate={getISODate(deployment?.recoverEvent?.unixTime)}
      endDate={getISODate(deployment?.endEvent?.unixTime)}
      onChangeGitTag={handleSaveGitTag}
      onSaveChanges={handleSaveDeployment}
      onSetDeploymentEventToCurrentTime={handleSetDeploymentTime}
      open
    />
  )
}

export default DeploymentDetails
