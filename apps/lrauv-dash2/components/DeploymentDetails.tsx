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

  const [pendingLaunchEvent, setPendingLaunchEvent] = useState<
    'launch' | 'recover' | null
  >(null)
  const [isDialogSubmitting, setIsDialogSubmitting] = useState(false)

  // Optimistic dates: set only on confirmed alter success to hide the "Mark X
  // time now" button immediately, before the query refetch delivers real props.
  // Cleared once real prop arrives via DeploymentDetailsPopUp's useEffect sync.
  const [optimisticLaunchDate, setOptimisticLaunchDate] = useState<
    string | undefined
  >()
  const [optimisticRecoverDate, setOptimisticRecoverDate] = useState<
    string | undefined
  >()
  const [optimisticEndDate, setOptimisticEndDate] = useState<
    string | undefined
  >()

  // Reset optimistic dates whenever the active deployment changes so stale
  // timestamps from a previous deployment never bleed into the new one.
  useEffect(() => {
    setOptimisticLaunchDate(undefined)
    setOptimisticRecoverDate(undefined)
    setOptimisticEndDate(undefined)
  }, [deployment?.deploymentId])

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

  // Helper: stamp the correct optimistic date after a successful launch/recover.
  const setOptimisticEventDate = (
    eventType: 'launch' | 'recover',
    date: string
  ) => {
    if (eventType === 'launch') setOptimisticLaunchDate(date)
    else setOptimisticRecoverDate(date)
  }

  const handleSetDeploymentTime = (event: AlterableEventType) => {
    if (event === 'launch' || event === 'recover') {
      // Guard: same check as the end path — no dialog without a valid deployment
      // and vehicle. Checking here prevents hasSubmittedRef from locking Submit
      // if the parent handler would otherwise return early with no feedback.
      if (!deployment?.deploymentId || !vehicle?.toLowerCase()) return
      // Show command dialog before recording the event (Dash4 parity)
      setPendingLaunchEvent(event)
      return
    }
    // 'end' records immediately with no command dialog
    if (deployment?.deploymentId) {
      const endedAt = DateTime.now().toISO()
      alterDeployment(
        {
          deploymentId: deployment.deploymentId as number,
          date: endedAt,
          deploymentType: event,
          note: '',
        },
        {
          onSuccess: () => setOptimisticEndDate(endedAt),
        }
      )
    }
  }

  const recordLaunchEvent = (
    event: AlterableEventType,
    date: string,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    if (!deployment?.deploymentId) {
      onError?.()
      return
    }
    const note = event === 'launch' ? 'Vehicle in water' : 'Vehicle recovered'
    alterDeployment(
      {
        deploymentId: deployment.deploymentId as number,
        date,
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
    const confirmedAt = DateTime.now().toISO()
    const note =
      eventType === 'launch' ? 'Vehicle in water' : 'Vehicle recovered'
    setIsDialogSubmitting(true)
    // Record the event first (Dash4 order: event → command). This ensures the
    // deployment is stamped even if the command send fails, and eliminates the
    // risk of duplicate commands when a user retries after a failed alter.
    recordLaunchEvent(
      eventType,
      confirmedAt,
      () => {
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
              setIsDialogSubmitting(false)
              setPendingLaunchEvent(null)
              setOptimisticEventDate(eventType, confirmedAt)
            },
            onError: () => {
              setIsDialogSubmitting(false)
              setPendingLaunchEvent(null)
              setOptimisticEventDate(eventType, confirmedAt)
              const label = eventType === 'launch' ? 'Launch' : 'Recover'
              toast.error(
                `${label} recorded but command failed to send. Retry the command manually.`
              )
            },
          }
        )
      },
      () => {
        setIsDialogSubmitting(false)
        setPendingLaunchEvent(null)
      }
    )
  }

  const handleDialogConfirmNoCommand = () => {
    if (!pendingLaunchEvent) return
    const eventType = pendingLaunchEvent
    const confirmedAt = DateTime.now().toISO()
    setIsDialogSubmitting(true)
    recordLaunchEvent(
      eventType,
      confirmedAt,
      () => {
        setIsDialogSubmitting(false)
        setPendingLaunchEvent(null)
        setOptimisticEventDate(eventType, confirmedAt)
      },
      () => {
        setIsDialogSubmitting(false)
        setPendingLaunchEvent(null)
      }
    )
  }

  const handleDialogCancel = () => {
    setPendingLaunchEvent(null)
  }

  return (
    <>
      {pendingLaunchEvent && (
        <LaunchCommandDialog
          event={pendingLaunchEvent}
          isSubmitting={isDialogSubmitting}
          onConfirmWithCommand={handleDialogConfirmWithCommand}
          onConfirmNoCommand={handleDialogConfirmNoCommand}
          onCancel={handleDialogCancel}
        />
      )}
      <DeploymentDetailsPopUp
        onClose={handleClose}
        name={deployment?.name ?? ''}
        complete={!!deployment?.endEvent || !!optimisticEndDate}
        tagOptions={tags?.map(({ tag }) => ({ id: tag, name: tag })) ?? []}
        queueSize={0}
        gitTag={deployment?.path ?? ''}
        logFiles={logFiles}
        directoryListFilepath={deployment?.dlistResult?.path}
        startDate={getISODate(deployment?.startEvent?.unixTime)}
        launchDate={
          getISODate(deployment?.launchEvent?.unixTime) ?? optimisticLaunchDate
        }
        recoverDate={
          getISODate(deployment?.recoverEvent?.unixTime) ??
          optimisticRecoverDate
        }
        endDate={
          getISODate(deployment?.endEvent?.unixTime) ?? optimisticEndDate
        }
        onChangeGitTag={handleSaveGitTag}
        onSaveChanges={handleSaveDeployment}
        onSetDeploymentEventToCurrentTime={handleSetDeploymentTime}
        open
      />
    </>
  )
}

export default DeploymentDetails
