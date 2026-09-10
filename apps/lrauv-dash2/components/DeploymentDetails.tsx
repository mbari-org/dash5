import { useEffect, useState } from 'react'
import {
  useTags,
  useUpdateDeployment,
  useAlterDeployment,
  useCreateCommand,
} from '@mbari/api-client'
import { DeploymentDetailsPopUp, AlterableEventType } from '@mbari/react-ui'
import type { DeploymentDetails as DeploymentDetailsType } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import useCurrentDeployment from '../lib/useCurrentDeployment'
import useGlobalModalId from '../lib/useGlobalModalId'
import toast from 'react-hot-toast'
import { LaunchCommandDialog, SendVia } from './LaunchCommandDialog'

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
  const { deployment, vehicle } = useCurrentDeployment()
  const { mutate: updateDeployment } = useUpdateDeployment()
  const alterDeployment = useAlterDeploymentWithEffects()
  const { mutate: createCommand } = useCreateCommand()
  const { setGlobalModalId } = useGlobalModalId()

  const [pendingLaunchEvent, setPendingLaunchEvent] =
    useState<AlterableEventType | null>(null)

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
  }: DeploymentDetailsType) => {
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

  const handleSetDeploymentTime = (event: AlterableEventType) => {
    if (event === 'launch' || event === 'recover') {
      // Show command dialog before recording the event (Dash4 parity)
      // Launch: command, mission, or none; Recover: command or none only
      setPendingLaunchEvent(event)
      return
    }
    // 'end' records immediately with no command dialog
    if (deployment?.deploymentId) {
      alterDeployment({
        deploymentId: deployment.deploymentId as number,
        date: DateTime.now().toISO(),
        deploymentType: event,
        note: '',
      })
    }
  }

  const recordLaunchEvent = (
    event: AlterableEventType,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    if (!deployment?.deploymentId) return
    const note = event === 'launch' ? 'Vehicle in water' : 'Vehicle recovered'
    alterDeployment(
      {
        deploymentId: deployment.deploymentId as number,
        date: DateTime.now().toISO(),
        deploymentType: event,
        note,
      },
      { onSuccess, onError }
    )
  }

  const handleDialogConfirmWithCommand = (
    command: string,
    via: SendVia,
    timeout?: number
  ) => {
    if (!deployment?.deploymentId || !pendingLaunchEvent) return
    const vehicleName = vehicle?.toLowerCase() ?? ''
    const eventType = pendingLaunchEvent
    const note =
      eventType === 'launch' ? 'Vehicle in water' : 'Vehicle recovered'
    createCommand(
      {
        vehicle: vehicleName,
        commandText: command,
        commandNote: note,
        schedDate: 'asap',
        runCommand: 'n',
        via,
        ...(timeout !== undefined ? { timeout } : {}),
      },
      {
        onSuccess: () => {
          setPendingLaunchEvent(null)
          recordLaunchEvent(eventType)
        },
        onError: () => {
          setPendingLaunchEvent(null)
          const label = eventType === 'launch' ? 'Launch' : 'Recover'
          toast.error(`Could not send command. ${label} event not recorded.`)
        },
      }
    )
  }

  const handleDialogConfirmNoCommand = () => {
    if (!pendingLaunchEvent) return
    const eventType = pendingLaunchEvent
    recordLaunchEvent(
      eventType,
      () => setPendingLaunchEvent(null),
      () => setPendingLaunchEvent(null)
    )
  }

  const handleDialogConfirmWithMission = () => {
    if (!pendingLaunchEvent) return
    const eventType = pendingLaunchEvent
    setPendingLaunchEvent(null)
    recordLaunchEvent(eventType, () => {
      setGlobalModalId({ id: 'newMission' })
    })
  }

  const handleDialogCancel = () => {
    setPendingLaunchEvent(null)
  }

  return (
    <>
      {pendingLaunchEvent && (
        <LaunchCommandDialog
          event={pendingLaunchEvent}
          onConfirmWithCommand={handleDialogConfirmWithCommand}
          onConfirmWithMission={handleDialogConfirmWithMission}
          onConfirmNoCommand={handleDialogConfirmNoCommand}
          onCancel={handleDialogCancel}
        />
      )}
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
    </>
  )
}

export default DeploymentDetails
