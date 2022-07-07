import { useTags, useUpdateDeployment } from '@mbari/api-client'
import { DeploymentDetailsPopUp } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import useCurrentDeployment from '../lib/useCurrentDeployment'

const DeploymentDetails: React.FC<{
  onClose?: () => void
}> = ({ onClose: handleClose }) => {
  const { deployment } = useCurrentDeployment()
  const { mutate: updateDeployment } = useUpdateDeployment()

  const { data: tags } = useTags({ limit: 30 })
  const getISODate = (time?: number) =>
    time ? DateTime.fromMillis(time).toISO() : undefined

  const contents = deployment?.dlistResult?.contents?.split('\n')
  const directoryIndex = contents?.findIndex(
    (line) => line.indexOf('set of logs') > -1
  )
  const logFiles = contents?.filter((_, i) => i > directoryIndex)
  const handleSaveGitTag = (gitTag: string) => {
    updateDeployment({
      deploymentId: deployment?.deploymentId,
      tag: gitTag,
    })
  }
  return (
    <DeploymentDetailsPopUp
      onClose={handleClose}
      name={deployment?.name ?? ''}
      complete={!!deployment?.endEvent}
      tagOptions={tags?.map(({ tag }) => ({ id: tag, name: tag })) ?? []}
      endTime={deployment?.endEvent?.unixTime ?? ''}
      queueSize={0}
      gitTag={deployment?.path ?? ''}
      logFiles={logFiles}
      directoryListFilepath={deployment?.dlistResult?.path}
      startDate={getISODate(deployment?.startEvent?.unixTime)}
      launchDate={getISODate(deployment?.launchEvent?.unixTime)}
      recoveryDate={getISODate(deployment?.recoverEvent?.unixTime)}
      endDate={getISODate(deployment?.endEvent?.unixTime)}
      onChangeGitTag={handleSaveGitTag}
      open
    />
  )
}

export default DeploymentDetails
