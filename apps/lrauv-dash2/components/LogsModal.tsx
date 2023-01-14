import { Modal } from '@mbari/react-ui'
import LogsSection from './LogsSection'
import { DateTime } from 'luxon'
import { capitalize } from '@mbari/utils'
import useCurrentDeployment from '../lib/useCurrentDeployment'

export interface LogsModalProps {
  vehicleName: string
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
}

export const LogsModal: React.FC<LogsModalProps> = ({
  vehicleName,
  className,
  style,
  onClose,
}) => {
  const { deployment } = useCurrentDeployment()
  const deploymentStartTime = deployment?.startEvent?.unixTime ?? 0
  const deploymentEndTime = deployment?.endEvent?.unixTime
  const formattedStart =
    DateTime.fromMillis(deploymentStartTime).toFormat('h:mm a MMM d, yyyy')
  const formattedEnd = deploymentEndTime
    ? DateTime.fromMillis(deploymentEndTime).toFormat('h:mm a MMM d, yyyy')
    : 'Present'
  return (
    <Modal
      className={className}
      style={{
        minHeight: '85vh',
        ...style,
      }}
      title={`Rendering logs for ${capitalize(
        vehicleName ?? ''
      )} from ${formattedStart} to ${formattedEnd}`}
      onClose={onClose}
      maximized
      open
    >
      <div className="flex flex-grow flex-col rounded border border-stone-200">
        <LogsSection
          vehicleName={vehicleName}
          from={DateTime.fromMillis(deploymentStartTime)
            .minus({ days: 1 })
            .toISO()}
          to={
            deploymentEndTime
              ? DateTime.fromMillis(deploymentEndTime).toISO()
              : undefined
          }
        />
      </div>
    </Modal>
  )
}
