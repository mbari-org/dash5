import {
  useVehicleInfo,
  GetVehicleInfoResponse,
  useDepthSparkline,
} from '@mbari/api-client'
import React from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import {
  FullWidthVehicleDiagram,
  FullWidthVehicleDiagramProps,
} from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTriangleExclamation,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { decodeHtmlEntities, formatCompactDuration } from '@mbari/utils'
import { useTethysApiContext } from 'api-client'

const DepthSparkline = dynamic(
  () =>
    import('@mbari/react-ui').then((mod) => ({ default: mod.DepthSparkline })),
  { ssr: false }
)

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
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST
  const { data: vehicleInfo } = useVehicleInfo(
    { name },
    baseUrl
      ? axios.create({
          baseURL: baseUrl,
          timeout: 5000,
        })
      : undefined,
    {
      enabled: !!name,
      staleTime: 0,
      refetchInterval: 30 * 1000,
    }
  )

  const now = DateTime.now()

  const vehicle =
    vehicleInfo?.not_found || !vehicleInfo
      ? undefined
      : (vehicleInfo as GetVehicleInfoResponse)

  const missionText = vehicle?.text_mission ?? ''

  const isDocked =
    missionText.indexOf('PLUGGED') >= 0 || missionText.indexOf('RECOVERED') >= 0
  const { data: sparklineData } = useDepthSparkline(
    { vehicle: name },
    { enabled: !!vehicle && !isDocked }
  )

  const formattedCellTime = lastCellCommsDT
    ? lastCellCommsDT.toFormat('HH:mm')
    : vehicle?.text_cell
  const formattedCellAgo = lastCellCommsDT
    ? `${formatCompactDuration(lastCellCommsDT, now, {
        maxDays: 6,
      })} ago`
    : vehicle?.text_cellago

  const formattedSatTime = lastSatCommsDT
    ? lastSatCommsDT.toFormat('HH:mm')
    : vehicle?.text_sat
  const formattedSatAgo = lastSatCommsDT
    ? `${formatCompactDuration(lastSatCommsDT, now, {
        maxDays: 6,
      })} ago`
    : vehicle?.text_commago

  const formattedNextComm = nextCommsText ?? vehicle?.text_nextcomm

  const { siteConfig } = useTethysApiContext()

  const sparklineContent =
    sparklineData && sparklineData.depthTimes.length > 0 ? (
      <DepthSparkline
        depthTimes={sparklineData.depthTimes}
        depthValues={sparklineData.depthValues}
        celTimes={sparklineData.celTimes}
        satTimes={sparklineData.satTimes}
        gpsTimes={sparklineData.gpsTimes}
        argoTimes={sparklineData.argoTimes}
        padded={sparklineData.padded}
        responsive
      />
    ) : undefined

  // Prefer the URL pattern from siteConfig so staging/dev deployments work without
  // hardcoding the production host. Fall back to the known production URL.
  const OKEANIDS_FALLBACK = `https://okeanids.mbari.org/widget/auv_${encodeURIComponent(
    name
  )}.svg`
  const okeanidsUrl = siteConfig?.appConfig.external.statusWidgets
    .lrauvStatusWidgetUrlPattern
    ? siteConfig.appConfig.external.statusWidgets.lrauvStatusWidgetUrlPattern.replace(
        '<vehicleName>',
        encodeURIComponent(name)
      )
    : OKEANIDS_FALLBACK

  const sharedDiagramProps: FullWidthVehicleDiagramProps = {
    textAmpAgo: vehicle?.text_ampago,
    textVehicle: vehicle?.text_vehicle ?? name,
    textCell: formattedCellTime,
    colorCell: vehicle?.color_cell,
    colorDirtbox: vehicle?.color_dirtbox,
    textSpeed: vehicle?.text_speed,
    textDvlStatus: vehicle?.text_dvlstatus,
    textStationDist: vehicle?.text_stationdist,
    textCommAgo: formattedSatAgo,
    textNextComm: formattedNextComm,
    textCriticalError: vehicle?.text_criticalerror,
    textTimeout: vehicle?.text_timeout,
    colorSatComm: vehicle?.color_satcomm,
    colorNextComm: vehicle?.color_satcomm,
    colorSmallCable: vehicle?.color_smallcable,
    textNote: vehicle?.text_note,
    textArriveStation: vehicle?.text_arrivestation,
    colorMissionAgo: vehicle?.color_missionago,
    textGps: vehicle?.text_gps,
    colorGps: vehicle?.color_gps,
    colorSw: vehicle?.color_sw,
    textCurrentDist: vehicle?.text_currentdist,
    textDroptime: vehicle?.text_droptime,
    colorDrop: vehicle?.color_drop,
    colorScheduled: vehicle?.color_scheduled,
    colorHw: vehicle?.color_hw,
    colorArrow: vehicle?.color_arrow,
    colorGf: vehicle?.color_gf,
    colorLowGf: vehicle?.color_lowgf,
    colorHighGf: vehicle?.color_highgf,
    colorMissionText: vehicle?.color_missiontext,
    colorLogAgo: vehicle?.color_logago,
    colorSatCommsText: vehicle?.color_satcommstext,
    colorNextCommsText: vehicle?.color_nextcommstext,
    colorTimeoutText: vehicle?.color_timeouttext,
    dockBuoy: vehicle?.dock_buoy,
    dockEye: vehicle?.dock_eye,
    dockLine: vehicle?.dock_line,
    dockTri: vehicle?.dock_tri,
    textGf: vehicle?.text_gf,
    colorFlow: vehicle?.color_flow,
    colorWavecolor: vehicle?.color_wavecolor ?? 'st0',
    textAmps: vehicle?.text_amps,
    colorAmps: vehicle?.color_amps,
    colorDvl: vehicle?.color_dvl,
    textGpsAgo: vehicle?.text_gpsago,
    colorArgo: vehicle?.color_argo,
    textCellAgo: formattedCellAgo,
    textNoteTime: vehicle?.text_notetime,
    textArrow: vehicle?.text_arrow,
    colorBat1: vehicle?.color_bat1,
    colorBat2: vehicle?.color_bat2,
    colorBat3: vehicle?.color_bat3,
    colorBat4: vehicle?.color_bat4,
    colorBat5: vehicle?.color_bat5,
    colorBat6: vehicle?.color_bat6,
    colorBat7: vehicle?.color_bat7,
    colorBat8: vehicle?.color_bat8,
    colorCart: vehicle?.color_cart,
    colorCartCircle: vehicle?.color_cartcircle,
    colorThrust: vehicle?.color_thrust,
    textSat: formattedSatTime,
    textLogTime: vehicle?.text_logtime,
    textMission: vehicle?.text_mission
      ? decodeHtmlEntities(vehicle.text_mission)
      : '',
    textReckonDistance: vehicle?.text_reckondistance,
    textCriticalTime: vehicle?.text_criticaltime,
    textGfTime: vehicle?.text_gftime,
    textThrustTime: vehicle?.text_thrusttime,
    textLogAgo: vehicle?.text_logago,
    colorBigCable: vehicle?.color_bigcable,
    textScheduled: vehicle?.text_scheduled,
    textLastUpdate: vehicle?.text_lastupdate,
    colorMissionDefault: vehicle?.color_missiondefault,
    textVolts: vehicle?.text_volts,
    colorVolts: vehicle?.color_volts,
    status:
      missionText.indexOf('PLUGGED') >= 0
        ? 'pluggedIn'
        : missionText.indexOf('RECOVERED') >= 0
        ? 'recovered'
        : 'onMission',
    colorLeak: vehicle?.color_leak,
    textLeakAgo: vehicle?.text_leakago,
    textLeak: vehicle?.text_leak,
    colorCtd: vehicle?.color_ctd,
    colorCameraBody: vehicle?.color_camerabody,
    colorCameraLens: vehicle?.color_cameralens,
    colorCam1: vehicle?.color_cam1,
    colorCam2: vehicle?.color_cam2,
    textCameraAgo: vehicle?.text_cameraago,
    colorVoltThresh: vehicle?.color_voltthresh,
    textVoltThresh: vehicle?.text_voltthresh,
    colorAmpThresh: vehicle?.color_ampthresh,
    textAmpThresh: vehicle?.text_ampthresh,
    textBatteryDuration: vehicle?.text_batteryduration,
    textBatteryUnits: vehicle?.text_batteryunits,
    textCurrent: vehicle?.text_current,
    textNeedsComms: vehicle?.text_needcomms,
    textMissionAgo: vehicle?.text_missionago,
    textVersion: vehicle?.text_version,
    svgCurrent: vehicle?.svg_current,
    colorDuration: vehicle?.color_duration,
    colorOt: vehicle?.color_ot,
    onBatteryClick: handleBatteryClick,
    sparklineContent,
    actionButton: isDocked ? undefined : (
      <a
        href={okeanidsUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Open in Okeanids"
        aria-label="Open in Okeanids"
        className="flex h-9 w-9 items-center justify-center rounded bg-teal-500 text-white shadow-md transition-colors hover:bg-teal-400"
      >
        <FontAwesomeIcon
          icon={faArrowUpRightFromSquare}
          className="text-base"
        />
      </a>
    ),
  }

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
        {...sharedDiagramProps}
        className={clsx(!vehicle && 'opacity-40', 'min-h-[200px]')}
      />
    </div>
  )
}

export default VehicleDiagram
