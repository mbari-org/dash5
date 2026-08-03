import { Modal } from '@mbari/react-ui'
import DocsSection from './DocsSection'
import { capitalize } from '@mbari/utils'

export interface DocsModalProps {
  vehicleName: string
  authenticated?: boolean
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
}

export const DocsModal: React.FC<DocsModalProps> = ({
  vehicleName,
  authenticated,
  className,
  style,
  onClose,
}) => {
  return (
    <Modal
      className={className}
      style={{
        minHeight: '85vh',
        ...style,
      }}
      title={`Rendering Docs for ${capitalize(vehicleName ?? '')}`}
      onClose={onClose}
      maximized
      blurBackground
      open
    >
      <div className="flex flex-grow flex-col rounded border border-stone-200">
        <DocsSection vehicleName={vehicleName} authenticated={authenticated} />
      </div>
    </Modal>
  )
}
