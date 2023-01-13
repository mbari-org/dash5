import { Modal, SelectField } from '@mbari/react-ui'
import { ScienceCell } from './ScienceDataSection'
import { capitalize } from '@mbari/utils'
import useCurrentDeployment from '../lib/useCurrentDeployment'
import { useChartData } from '@mbari/api-client'
import { useState } from 'react'

export interface ChartsModalProps {
  vehicleName: string
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
}

export const ChartsModal: React.FC<ChartsModalProps> = ({
  vehicleName,
  className,
  style,
  onClose,
}) => {
  const { deployment } = useCurrentDeployment()
  const deploymentStartTime = deployment?.startEvent?.unixTime ?? 0
  const deploymentEndTime = deployment?.endEvent.unixTime

  const { data: chartData } = useChartData({
    vehicle: vehicleName,
    from: deploymentStartTime,
    to: deploymentEndTime,
  })
  const [chart, setChart] = useState<string | null>(null)
  const data = chartData?.find((c) => c.name === chart)
  return (
    <Modal
      className={className}
      style={{
        minHeight: '85vh',
        ...style,
      }}
      title={`Rendering science and data charts for ${capitalize(
        vehicleName ?? ''
      )}`}
      onClose={onClose}
      maximized
      open
    >
      <div className="flex">
        <SelectField
          name="Chart"
          value={chart ?? ''}
          options={chartData?.map((c) => ({ id: c.name, name: c.name })) ?? []}
          onSelect={setChart}
          className="mb-2 w-full"
        />
      </div>
      <div className="flex flex-grow flex-col">
        {data ? (
          <ScienceCell
            color="#666"
            unit={data?.units ?? ''}
            title={data?.name ?? 'Data'}
            name={data?.name ?? 'Unknown'}
            values={data?.values}
            times={data?.times}
            chartHeightClassname="h-[65vh]"
            timeout={0}
          />
        ) : (
          <p className="my-auto text-center font-bold text-stone-600">
            Choose a data set from above...
          </p>
        )}
      </div>
    </Modal>
  )
}
