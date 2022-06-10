import { MissionProgressToolbar, OverviewToolbar } from '@mbari/react-ui'
import { NextPage } from 'next'
import Layout from '../components/Layout'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// This is a tricky workaround to prevent leaflet from crashing next.js
// SSR. If we don't do this, the leaflet map will be loaded server side
// and throw a window error.
const Map = dynamic(() => import('@mbari/react-ui/dist/Map/Map'), {
  ssr: false,
})

const styles = {
  content: 'flex flex-shrink flex-grow flex-row overflow-hidden',
  primary: 'flex w-3/4 flex-shrink flex-grow flex-col',
  mapContainer: 'flex flex-shrink flex-grow bg-blue-300',
  secondary: 'flex w-[438px] flex-shrink-0 flex-col bg-slate-400',
}

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
      <div className={styles.content}>
        <section className={styles.primary}>
          <MissionProgressToolbar
            startTime={startTime}
            endTime={endTime}
            ticks={6}
            ariaLabel="Mission Progress"
            className="bg-secondary-300/60"
          />
          <div className={styles.mapContainer}>
            <Map className="h-full w-full" />
          </div>
        </section>
        <section className={styles.secondary}></section>
      </div>
    </Layout>
  )
}

export default OverviewPage
