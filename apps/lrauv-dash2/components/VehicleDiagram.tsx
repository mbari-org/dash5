import {
  useSiteConfig,
  useVehicleInfo,
  GetVehicleInfoResponse,
} from '@mbari/api-client'
import React, { useMemo } from 'react'
import axios from 'axios'
import {
  FullWidthVehicleDiagram,
  FullWidthVehicleDiagramProps,
} from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { decodeHtmlEntities, formatCompactDuration } from '@mbari/utils'
import { useQuery } from 'react-query'

const VehicleDiagram: React.FC<{
  name: string
  className?: string
  style?: React.CSSProperties
  onBatteryClick?: FullWidthVehicleDiagramProps['onBatteryClick']
  lastCellCommsTime?: DateTime | null
  lastSatCommsTime?: DateTime | null
  nextCommsText?: string | null
}> = ({
  name,
  className,
  style,
  onBatteryClick: handleBatteryClick,
  lastCellCommsTime: lastCellCommsDT,
  lastSatCommsTime: lastSatCommsDT,
  nextCommsText,
}) => {
  const { data: siteConfig } = useSiteConfig()

  // Fallback url for local development
  const fallbackVehicleInfoUrl = useMemo(() => {
    const pattern =
      siteConfig?.appConfig.external.statusWidgets?.lrauvStatusWidgetUrlPattern
    if (!pattern) return null
    return pattern.replace(/<vehicleName>/gi, name).replace('.svg', '.json')
  }, [
    siteConfig?.appConfig.external.statusWidgets?.lrauvStatusWidgetUrlPattern,
    name,
  ])

  const baseUrl = process.env.NEXT_PUBLIC_API_HOST
  const primaryVehicleInfo = useVehicleInfo(
    { name },
    baseUrl
      ? axios.create({
          baseURL: baseUrl,
          timeout: 5000,
        })
      : undefined,
    {
      enabled: !!baseUrl && !!name,
      staleTime: 0,
    }
  )

  const { data: fallbackVehicleInfo } = useQuery(
    ['vehicleInfoFallback', name, fallbackVehicleInfoUrl],
    async () => {
      if (!fallbackVehicleInfoUrl) return { not_found: true }
      try {
        const response = await axios.get(fallbackVehicleInfoUrl, {
          timeout: 5000,
        })
        return response.data as GetVehicleInfoResponse
      } catch (e: unknown) {
        if ((e as any)?.response?.status === 404) {
          return { not_found: true }
        }
        throw e
      }
    },
    {
      enabled:
        !!fallbackVehicleInfoUrl &&
        !!name &&
        (primaryVehicleInfo.isError ||
          primaryVehicleInfo.data?.not_found ||
          (!primaryVehicleInfo.data && !primaryVehicleInfo.isLoading)),
      staleTime: 0,
      refetchInterval: 30 * 1000,
    }
  )

  // Use primary if available, otherwise fallback
  const vehicleInfo =
    primaryVehicleInfo.data && !primaryVehicleInfo.data.not_found
      ? primaryVehicleInfo.data
      : fallbackVehicleInfo

  const vehicle =
    vehicleInfo?.not_found || !vehicleInfo
      ? undefined
      : (vehicleInfo as GetVehicleInfoResponse)

  const formattedCellTime = lastCellCommsDT
    ? lastCellCommsDT.toFormat('HH:mm')
    : vehicle?.text_cell
  const formattedCellAgo = lastCellCommsDT
    ? `${formatCompactDuration(lastCellCommsDT)} ago`
    : vehicle?.text_cellago

  const formattedSatTime = lastSatCommsDT
    ? lastSatCommsDT.toFormat('HH:mm')
    : vehicle?.text_sat
  const formattedSatAgo = lastSatCommsDT
    ? `${formatCompactDuration(lastSatCommsDT)} ago`
    : vehicle?.text_commago

  const formattedNextComm = nextCommsText ?? vehicle?.text_nextcomm

  return (
    <div
      className={clsx(className, 'relative flex overflow-hidden')}
      style={style}
    >
      {!vehicle ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="m-auto rounded border border-amber-300 bg-amber-200 p-4 text-amber-600 shadow-lg shadow-amber-800">
            <FontAwesomeIcon icon={faTriangleExclamation} /> Vehicle Info Not
            Available
          </div>
        </div>
      ) : null}
      <FullWidthVehicleDiagram
        className={clsx(className, !vehicle && 'opacity-40', 'min-h-[200px]')}
        textAmpAgo={vehicle?.text_ampago}
        textVehicle={vehicle?.text_vehicle ?? name}
        textCell={formattedCellTime}
        colorCell={vehicle?.color_cell}
        colorDirtbox={vehicle?.color_dirtbox}
        textSpeed={vehicle?.text_speed}
        textDvlStatus={vehicle?.text_dvlstatus}
        textStationDist={vehicle?.text_stationdist}
        textCommAgo={formattedSatAgo}
        textNextComm={formattedNextComm}
        textCriticalError={vehicle?.text_criticalerror}
        textTimeout={vehicle?.text_timeout}
        colorSatComm={vehicle?.color_satcomm}
        colorSmallCable={vehicle?.color_smallcable}
        textNote={vehicle?.text_note}
        textArriveStation={vehicle?.text_arrivestation}
        colorMissionAgo={vehicle?.color_missionago}
        textGps={vehicle?.text_gps}
        colorGps={vehicle?.color_gps}
        colorSw={vehicle?.color_sw}
        textCurrentDist={vehicle?.text_currentdist}
        textDroptime={vehicle?.text_droptime}
        colorDrop={vehicle?.color_drop}
        colorScheduled={vehicle?.color_scheduled}
        colorHw={vehicle?.color_hw}
        colorArrow={vehicle?.color_arrow}
        colorGf={vehicle?.color_gf}
        textGf={vehicle?.text_gf}
        colorFlow={vehicle?.color_flow}
        colorWavecolor={vehicle?.color_wavecolor ?? 'st0'}
        textAmps={vehicle?.text_amps}
        colorAmps={vehicle?.color_amps}
        colorDvl={vehicle?.color_dvl}
        textGpsAgo={vehicle?.text_gpsago}
        textCellAgo={formattedCellAgo}
        textNoteTime={vehicle?.text_notetime}
        textArrow={vehicle?.text_arrow}
        colorBat1={vehicle?.color_bat1}
        colorBat2={vehicle?.color_bat2}
        colorBat3={vehicle?.color_bat3}
        colorBat4={vehicle?.color_bat4}
        colorBat5={vehicle?.color_bat5}
        colorBat6={vehicle?.color_bat6}
        colorBat7={vehicle?.color_bat7}
        colorBat8={vehicle?.color_bat8}
        colorCart={vehicle?.color_cart}
        colorCartCircle={vehicle?.color_cartcircle}
        colorThrust={vehicle?.color_thrust}
        textSat={formattedSatTime}
        textLogTime={vehicle?.text_logtime}
        textMission={
          vehicle?.text_mission ? decodeHtmlEntities(vehicle.text_mission) : ''
        }
        textReckonDistance={vehicle?.text_reckondistance}
        textCriticalTime={vehicle?.text_criticaltime}
        textGfTime={vehicle?.text_gftime}
        textThrustTime={vehicle?.text_thrusttime}
        textLogAgo={vehicle?.text_logago}
        colorBigCable={vehicle?.color_bigcable}
        textScheduled={vehicle?.text_scheduled}
        textLastUpdate={vehicle?.text_lastupdate}
        colorMissionDefault={vehicle?.color_missiondefault}
        textVolts={vehicle?.text_volts}
        colorVolts={vehicle?.color_volts}
        status={
          (vehicle?.text_mission?.indexOf('PLUGGED') ?? -1) >= 0
            ? 'pluggedIn'
            : 'onMission'
        }
        colorLeak={vehicle?.color_leak}
        textLeakAgo={vehicle?.text_leakago}
        textLeak={vehicle?.text_leak}
        onBatteryClick={handleBatteryClick}
      />
    </div>
  )
}

export default VehicleDiagram
