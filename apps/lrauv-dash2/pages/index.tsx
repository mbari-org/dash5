import { MissionProgressToolbar, OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('../components/Map'), { ssr: false })

const OverviewPage: NextPage = () => {
  const startTime = DateTime.utc().minus({ weeks: 1 }).toISO()
  const endTime = DateTime.utc().plus({ days: 4 }).toISO()
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
  })
  return (
    <Layout>
      <OverviewToolbar
        pilotInCharge="Shannon J."
        pilotOnCall="Bryan K."
        deployment="Overview"
        onClickPilot={() => undefined}
      />
      <div className="flex flex-grow flex-row">
        <section className="flex w-3/4 flex-grow flex-col">
          <MissionProgressToolbar
            startTime={startTime}
            endTime={endTime}
            ticks={6}
            ariaLabel="Mission Progress"
            className="bg-secondary-300/60"
          />
          <div className="flex-grow bg-violet-400">
            <Map className="h-full w-full" />
          </div>
        </section>
        <section className="flex w-1/4 flex-col bg-slate-400"></section>
      </div>
    </Layout>
  )
}

export default OverviewPage
