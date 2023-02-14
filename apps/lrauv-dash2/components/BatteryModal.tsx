import { BatteryMonitorPopup } from '@mbari/react-ui'
import dynamic from 'next/dynamic'
import { useChartData } from '@mbari/api-client'
import useCurrentDeployment from '../lib/useCurrentDeployment'
import { DateTime } from 'luxon'
import useGlobalModalId from '../lib/useGlobalModalId'
import { ScienceCell } from './ScienceDataSection'
const LineChart: any = dynamic(
  () => import('@mbari/react-ui/dist/Charts/LineChart'),
  {
    ssr: false,
  }
)

export interface BatteryModalProps {
  vehicleName: string
  onClose?: () => void
}

export const BatteryModal: React.FC<BatteryModalProps> = ({
  vehicleName,
  onClose: handleClose,
}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const { deployment } = useCurrentDeployment()
  const deploymentStartTime = deployment?.startEvent?.unixTime ?? 0
  const deploymentEndTime = deployment?.endEvent?.unixTime

  const {
    data: chartData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useChartData({
    vehicle: vehicleName,
    from: DateTime.fromMillis(deploymentStartTime).toISO(),
    to: deploymentEndTime
      ? DateTime.fromMillis(deploymentEndTime).toISO()
      : undefined,
  })

  const data = chartData?.find((c) => c.name === 'battery_charge')
  console.log(chartData)
  console.log(data)

  const timeRemaining = data?.times
    ? (Math.max(...(data?.times ?? [])) - Math.min(...(data?.times ?? []))) /
      60 /
      60 /
      1000
    : 0
  const batteryRemaining = data?.values
    ? (Math.min(...(data?.values ?? [])) / Math.max(...(data?.values ?? []))) *
      100
    : 0
  return (
    <BatteryMonitorPopup
      onClose={handleClose}
      batteryPercent={Number(batteryRemaining.toPrecision(2))}
      batteryRemaining={{
        hours: Number(timeRemaining.toPrecision(3)),
        distance: {
          value: Number((timeRemaining * 3.2).toPrecision(3)),
          unit: 'km',
        },
      }}
      suggestions={[
        {
          headline: 'Reduce thruster speeds to 25% power',
          important: true,
          improvement: '1hr',
          description:
            'Has the biggest impact on battery. This is the top recommendation to conserve battery life.',
          onExternalInfoClick: () => {
            setGlobalModalId({ id: 'newCommand' })
          },
        },
        {
          headline: 'Turn off DVL',
          improvement: '30min',
          description: 'Moderate energy savings',
        },
        {
          headline: 'Turn off cell comms',
          improvement: '20min',
          description: 'Bold move',
        },
      ]}
      open
    >
      {chartData ? (
        <ScienceCell
          color="#666"
          unit={data?.units ?? ''}
          title={data?.name ?? 'Data'}
          name={data?.name ?? 'Unknown'}
          values={data?.values}
          times={data?.times}
          chartHeightClassname="h-[300px]"
          timeout={0}
        />
      ) : null}
    </BatteryMonitorPopup>
  )
}
