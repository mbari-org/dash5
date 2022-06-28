import React, { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { DateTime } from 'luxon'

const { fromISO, max } = DateTime

const formatTo2Digits = (num: number) => (num < 10 ? `0${num}` : num)
const getLastSample = (...dateTimes: DateTime[]) => max(...dateTimes)
const getSamplesStats = (samples: Sample[]) => {
  const { good, failed, validISOs } = samples.reduce<{
    good: number
    failed: number
    validISOs: DateTime[]
  }>(
    (acc, { status, timeCollected = '' }) => {
      const iso = fromISO(timeCollected)
      if (iso.isValid) {
        acc['validISOs'].push(iso)
      }

      if (status === 'good') {
        acc['good']++
      }

      if (status === 'fail') {
        acc['failed']++
      }

      return acc
    },
    { good: 0, failed: 0, validISOs: [] }
  )

  const latestSample = getLastSample(...validISOs)

  return { good, failed, latestSample }
}

type Status = 'partial' | 'fail' | 'good' | 'default'

type Modifier = 'redo' | 'last' | 'reused' | 'default'

const useInterval = (cb: () => void, ms: number) => {
  const savedCb = useRef<typeof cb>(cb)

  useEffect(() => {
    savedCb.current = cb
  }, [cb])

  useEffect(() => {
    if (!ms && ms !== 0) {
      return
    }

    const id = setInterval(() => savedCb.current(), ms)

    return () => {
      clearInterval(id)
    }
  }, [ms])
}

export interface Sample {
  percentCompleted?: number
  quantity?: number
  status?: Status
  modifier?: Modifier
  timeCollected?: string
}

export interface SampleCollectionViewProps {
  className?: string
  samples: Sample[]
  archived: Sample
  vehicleName: string
}

export const SampleCollectionView: React.FC<SampleCollectionViewProps> = ({
  className,
  samples,
  archived,
  vehicleName,
}) => {
  const { good, failed, latestSample } = getSamplesStats(samples)

  return (
    <div className={clsx('h-full w-full bg-gray-100 p-4', className)}>
      <Samples samples={samples} />
      <div className="mx-3 my-2 flex flex-row">
        <div className="w-1/2">
          <LastSample latestSample={latestSample} vehicleName={vehicleName} />
          <ColorCodes />
        </div>
        <div className="w-1/2">
          <Stats
            archived={archived}
            goodSamplesCount={good}
            failedSamplesCount={failed}
          />
        </div>
      </div>
    </div>
  )
}

interface ColorCodeProps {
  className: string
  noBorder?: boolean
}

const ColorCode: React.FC<ColorCodeProps> = ({
  className,
  noBorder = false,
  children,
}) => (
  <li
    className={clsx(
      'mx-2 flex h-10 w-10 flex-row items-center justify-center rounded-full uppercase',
      className,
      {
        'border-0': noBorder,
        'border-4': !noBorder,
      }
    )}
  >
    <p className="text-lg tracking-tight">{children}</p>
  </li>
)

interface SamplesProps {
  samples: Sample[]
}

const Samples: React.FC<SamplesProps> = ({ samples }) => (
  <ul className="flex flex-row flex-wrap gap-2">
    {samples.map((sample, index) => (
      <Sample
        sample={sample}
        order={index + 1}
        key={`${sample.timeCollected}_${sample.quantity}_${sample.status}`}
      />
    ))}
  </ul>
)

const statusesBackgroundColor = {
  good: 'bg-green-600',
  partial: 'bg-yellow-300',
  fail: 'bg-amber-500',
  default: 'bg-gray-300',
}

const modifiersBorderColor = {
  last: 'border-4 border-solid border-purple-800',
  redo: 'border-4 border-dashed border-blue-800',
  reused: 'border-4 border-solid border-green-600',
  default: 'border-0 border-transparent',
}

interface SampleProps {
  sample: Sample
  order: number
}

const Sample: React.FC<SampleProps> = ({
  sample: {
    percentCompleted,
    quantity,
    modifier = 'default',
    status = 'default',
  },
  order,
}) => {
  const background = statusesBackgroundColor[status]
  const borderColor = modifiersBorderColor[modifier]

  return (
    <li
      data-testid={`sample_${order}`}
      className={clsx(
        'flex h-24 w-24 flex-row flex-wrap rounded-full',
        borderColor
      )}
    >
      <div
        data-testid={`sample_content_${order}`}
        className={clsx(
          'm-1 flex w-full flex-col items-center justify-center rounded-full',
          background
        )}
      >
        {status === 'fail' ? (
          <span className="text-xs text-purple-600">--X--</span>
        ) : null}
        {percentCompleted && status === 'partial' ? (
          <span className="text-xs text-purple-600">{percentCompleted}%</span>
        ) : null}
        <span className="text-lg">{formatTo2Digits(order)}</span>
        {quantity ? (
          <span className="text-xs font-medium text-gray-700">{quantity}</span>
        ) : null}
      </div>
    </li>
  )
}

interface LastSampleProps {
  latestSample: DateTime
  vehicleName: string
}

const LastSample: React.FC<LastSampleProps> = ({
  latestSample,
  vehicleName,
}) => {
  const [now, setNow] = useState(DateTime.now())

  useInterval(() => {
    setNow(DateTime.now())
  }, 1000)

  const day = now.ordinal - latestSample?.ordinal ?? 0
  const hrs = now.hour - latestSample?.hour ?? 0
  const mins = now.minute - latestSample?.minute ?? 0

  return (
    <h3 className="my-2 text-xl font-semibold">
      Last Sample: {day}d {hrs}h {mins}m ago -{' '}
      <span className="uppercase">{vehicleName}</span>
    </h3>
  )
}

const ColorCodes: React.FC = () => (
  <ul className="flex flex-row flex-wrap gap-4">
    <ColorCode className={statusesBackgroundColor['good']} noBorder>
      good
    </ColorCode>
    <ColorCode className={statusesBackgroundColor['partial']} noBorder>
      part
    </ColorCode>
    <ColorCode className={statusesBackgroundColor['fail']} noBorder>
      fail
    </ColorCode>
    <ColorCode className={modifiersBorderColor['last']}>last</ColorCode>
    <ColorCode className={modifiersBorderColor['redo']}>redo</ColorCode>
    <ColorCode className={modifiersBorderColor['reused']}>reused</ColorCode>
  </ul>
)

interface StatsProps {
  archived: Sample
  goodSamplesCount: number
  failedSamplesCount: number
}

const Stats: React.FC<StatsProps> = ({
  archived,
  goodSamplesCount,
  failedSamplesCount,
}) => {
  const formatted = fromISO(archived.timeCollected ?? '').toFormat(
    'ddLLLyy - hh:mm'
  )

  return (
    <>
      <h3 className="mt-2 text-lg font-medium">
        <span className="uppercase">archived: </span>
        {formatted} ({archived.quantity})
      </h3>
      <ul>
        <li className="font-medium capitalize">
          good samples: {goodSamplesCount}
        </li>
        <li className="font-medium capitalize">
          sample failed: {failedSamplesCount}
        </li>
      </ul>
      <span className="text-sm text-gray-400">
        (Samples count down from high to low)
      </span>
    </>
  )
}

SampleCollectionView.displayName = 'Views.SampleCollectionView'
