import { Modal, Spinner } from '@mbari/react-ui'
import { capitalize } from '@mbari/utils'
import { useSiteConfig } from '@mbari/api-client'

export interface ESPModalProps {
  vehicleName: string
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
}

export const ESPModal: React.FC<ESPModalProps> = ({
  vehicleName,
  className,
  style,
  onClose,
}) => {
  const { data } = useSiteConfig({})
  const svgUrl =
    data?.appConfig.external.statusWidgets.espStatusWidgetUrlPattern.replace(
      '<vehicleName>',
      vehicleName
    )
  return (
    <Modal
      className={className}
      style={style}
      title={`ESP Samples ${capitalize(vehicleName ?? '')}`}
      onClose={onClose}
      snapTo="top-right"
      allowPointerEventsOnChildren
      open
    >
      <div className="flex flex-grow flex-col rounded border border-stone-200">
        {svgUrl ? (
          <img src={svgUrl} className="block h-auto w-full" />
        ) : (
          <Spinner className="m-auto" />
        )}
      </div>
    </Modal>
  )
}
