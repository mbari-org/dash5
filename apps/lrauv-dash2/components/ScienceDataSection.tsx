import { SelectField, AbsoluteOverlay } from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { capitalize, humanize, swallow } from '@mbari/utils'
import { useChartData } from '@mbari/api-client'
import { AccordionCells } from '@mbari/react-ui'
import clsx from 'clsx'

const LineChart = dynamic(
  () => import('@mbari/react-ui/dist/Charts/LineChart'),
  {
    ssr: false,
  }
)

const vehicleUnits = ['arcdeg', 'deg', 'm', 's', 'v', 'rad', 'ma', 'ah']

export const ScienceCell: React.FC<{
  title?: string
  color: string
  name: string
  unit: string
  values?: number[]
  times?: number[]
  timeout?: number
  cellHeightClassname?: string
  chartHeightClassname?: string
}> = ({
  color,
  values,
  times,
  unit,
  name,
  timeout: timeoutms,
  cellHeightClassname = 'h-[340px]',
  chartHeightClassname = 'h-[320px]',
}) => {
  const [ready, setReady] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    if (!ready && !timeout.current) {
      setTimeout(() => {
        setReady(true)
      }, timeoutms ?? 2000)
    }
    const currentTimeout = timeout.current
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
    }
  }, [ready, timeout, setReady])

  const metric = `${capitalize(name)} (${unit})`
  return (
    <div
      className={clsx(
        cellHeightClassname,
        'w-full border-b border-b-slate-200 p-4'
      )}
    >
      <div className={clsx(chartHeightClassname, 'relative my-auto')}>
        {values && times && ready ? (
          <LineChart
            data={values?.map((v, i) => ({
              timestamp: times?.[i],
              value: v,
            }))}
            title={humanize(metric)}
            color={color}
            name={metric}
            className="absolute inset-0 w-full"
            inverted={name === 'depth'}
          />
        ) : (
          <AbsoluteOverlay />
        )}
      </div>
    </div>
  )
}

const ScienceDataSection: React.FC<{
  vehicleName: string
  from: string
  to?: string
}> = ({ vehicleName, from, to }) => {
  const { setGlobalModalId } = useGlobalModalId()
  const {
    data: chartData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useChartData({
    vehicle: vehicleName,
    from: from,
    to: to,
  })
  const [category, setCategory] = useState<string | null>('vehicle')

  const charts = chartData?.filter((d) =>
    category === 'vehicle'
      ? vehicleUnits.includes(d.units.toLowerCase())
      : !vehicleUnits.includes(d.units.toLowerCase())
  )

  const cellAtIndex = (index: number) => {
    const item = charts?.[index]
    return (
      <ScienceCell
        color="#666"
        unit={item?.units ?? ''}
        title={item?.name ?? 'Data'}
        name={item?.name ?? 'Unknown'}
        values={item?.values}
        times={item?.times}
      />
    )
  }

  const handleespSamples = swallow(() => {
    setGlobalModalId({ id: 'espSamples' })
  })

  return (
    <>
      <header className="flex p-2">
        <SelectField
          name="category"
          value={category ?? ''}
          options={[
            { id: 'vehicle', name: 'Vehicle' },
            { id: 'science', name: 'Science' },
          ]}
          onSelect={setCategory}
          className="my-auto"
        />
        <button
          className="my-auto ml-auto px-4 py-2 font-bold text-violet-800"
          onClick={handleespSamples}
        >
          ESP Samples
        </button>
      </header>
      <div className="relative flex h-full flex-shrink flex-grow">
        <div className="absolute inset-0 w-full overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex">
              <p className="m-auto rounded border border-slate-200 py-2 px-4 font-bold">
                Loading...
              </p>
            </div>
          )}
          {isError && (
            <div className="m-2 rounded bg-red-200 p-2 text-red-700">
              <p className="font-bold">
                Science data could not be processed for this mission:
              </p>
              <p>{(error as any)?.message}</p>
            </div>
          )}
          <AccordionCells
            cellAtIndex={cellAtIndex}
            count={charts?.length}
            loading={isLoading || isFetching}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-stone-400/20" />
      </div>
    </>
  )
}

export default ScienceDataSection
