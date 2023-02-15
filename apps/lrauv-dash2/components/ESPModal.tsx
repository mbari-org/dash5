/* eslint @next/next/no-img-element: "off" */
import { Modal, Spinner } from '@mbari/react-ui'
import { capitalize } from '@mbari/utils'
import { useSiteConfig } from '@mbari/api-client'
import { useState } from 'react'

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
  const svgUrl = `
    ${data?.appConfig.external.statusWidgets.espStatusWidgetUrlPattern.replace(
      '<vehicleName>',
      vehicleName
    )}?x=${Date.now()}`
  const [error, setError] = useState(false)
  const handleError = () => {
    setError(true)
  }
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
      {error && (
        <div>
          <p className="font-bold text-red-600">
            No ESP sample data available for this vehicle.
          </p>
        </div>
      )}
      {!error && (
        <div className="flex flex-grow flex-col rounded">
          {svgUrl ? (
            <img
              src={svgUrl}
              className="my-auto block h-auto w-full"
              alt=""
              onError={handleError}
            />
          ) : (
            <Spinner className="m-auto" />
          )}
        </div>
      )}
    </Modal>
  )
}
