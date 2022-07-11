import { CellVirtualizer, Virtualizer, SelectField } from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import dynamic from 'next/dynamic'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { swallow } from '@mbari/utils'

const DepthChart = dynamic(
  () => import('@mbari/react-ui/dist/Charts/DepthChart'),
  {
    ssr: false,
  }
)

// interface ScienceDataSectionProps {}

const fakeData = [
  { title: 'Average Current', color: '#00bcd4', type: 'vehicle' },
  { title: 'Navigation', color: '#f9c856', type: 'vehicle' },
  { title: 'Depth', color: '#4caf50', type: 'vehicle' },
  { title: 'Chlorophyl', color: '#f9c856', type: 'science' },
  { title: 'Salinity', color: '#4caf50', type: 'science' },
  { title: 'Temperature', color: '#4caf50', type: 'science' },
]

const FakeScienceCell: React.FC<{ title: string; color: string }> = ({
  title,
  color,
}) => {
  const [data] = useState(
    new Array(60).fill('').map((_, i) => ({
      value: Math.random() * 200,
      timestamp: DateTime.now()
        .minus({ hours: 60 - i })
        .toMillis(),
    }))
  )

  return (
    <div className="h-[341px] w-full border-b border-b-slate-200 pb-1">
      <DepthChart
        data={data}
        title={title}
        color={color}
        name="Depth"
        className="-mt-4 h-[340px] w-full"
      />
    </div>
  )
}

const ScienceDataSection: React.FC = ({}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const [category, setCategory] = useState<string | null>('vehicle')
  const data = fakeData.filter((d) => d.type === category)

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    return (
      <FakeScienceCell
        color={item?.color ?? '#666'}
        title={item?.title ?? 'Data'}
      />
    )
  }

  const handleEsbSamples = swallow(() => {
    setGlobalModalId('esb-samples')
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
          onClick={handleEsbSamples}
        >
          ESB Samples
        </button>
      </header>
      <div className="relative flex h-full flex-shrink flex-grow">
        <CellVirtualizer
          cellAtIndex={cellAtIndex}
          count={data?.length ?? 0}
          className="absolute inset-0 w-full"
          estimateSize={() => 400}
        />
      </div>
    </>
  )
}

export default ScienceDataSection
