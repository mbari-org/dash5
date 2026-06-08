import React, { useMemo } from 'react'
import clsx from 'clsx'

export interface DepthSparklineProps {
  depthTimes: number[]   // minutes since epoch
  depthValues: number[]  // meters
  celTimes: number[]     // ms epoch — cell comms
  satTimes: number[]     // ms epoch — sat comms
  gpsTimes: number[]     // ms epoch — GPS fixes
  argoTimes: number[]    // ms epoch — Argo receives
  padded?: boolean       // true when trailing points are faked
  width?: number         // SVG box width (default 120)
  height?: number        // SVG box height (default 20)
  windowMinutes?: number // time window to show (default 480 = 8h)
  className?: string
  style?: React.CSSProperties
}

// Dynamic max-depth scale matching auvstatus.py
const DEPTH_STOPS = [40, 80, 120, 160, 240, 300, 600, 1200, 1600, 2500]

function chooseDepthScale(maxVal: number): number {
  for (const stop of DEPTH_STOPS) {
    if (maxVal <= stop + 5) return stop
  }
  return DEPTH_STOPS[DEPTH_STOPS.length - 1]
}

// Convert ms-epoch times to decimated x-pixel positions within the box.
// Matches auvstatus.py decimateTimes().
function decimateTimes(
  timesMs: number[],
  nowMin: number,
  xdiv: number,
  boxRight: number,
  resolution = 2
): number[] {
  if (!timesMs.length) return []
  const offset = 0.25
  const xplist = timesMs.map((t) => boxRight - (nowMin - (t / 1000) / 60) / xdiv)
  const decimated = new Set(
    xplist.map((x) => Math.floor((x - offset) / resolution) * resolution)
  )
  return Array.from(decimated)
}

// Format ms offset as "HH:MM"
function fmtHoursMin(ms: number): string {
  const totalMin = Math.round(Math.abs(ms) / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}:${m.toString().padStart(2, '0')}`
}

// Format ms offset as "Xm ago" / "Xh ago"
function fmtAgo(deltaMs: number): string {
  const absMin = Math.round(Math.abs(deltaMs) / 60000)
  if (absMin < 60) return `${absMin}m ago`
  const h = (Math.abs(deltaMs) / 3600000).toFixed(1)
  return `${h}h ago`
}

const DepthSparkline: React.FC<DepthSparklineProps> = ({
  depthTimes,
  depthValues,
  celTimes,
  satTimes,
  gpsTimes,
  argoTimes,
  padded = false,
  width: w = 120,
  height: h = 20,
  windowMinutes = 480,
  className,
  style,
}) => {
  const nowMs = Date.now()
  const nowMin = nowMs / 1000 / 60

  const x0 = 0
  const y0 = 0
  const boxRight = x0 + w

  const xdiv = windowMinutes / w  // minutes per pixel

  const svgWidth = w + 42   // extra right margin for legend/labels
  const svgHeight = h + 20  // extra bottom margin for axis labels + top for tick rows

  // Rows of comms ticks sit above the depth box
  const tickRowHeight = 1.5
  const tickRowGap = 2
  const tickRows: Record<string, { times: number[]; color: string; y: number }> = {
    cel:  { times: celTimes,  color: '#22c55e', y: y0 - tickRowGap },
    sat:  { times: satTimes,  color: '#f97316', y: y0 - tickRowGap * 2 },
    gps:  { times: gpsTimes,  color: '#a855f7', y: y0 - tickRowGap * 3 },
    argo: { times: argoTimes, color: '#3b82f6', y: y0 - tickRowGap * 4 },
  }
  const tickAreaHeight = tickRowGap * 4 + tickRowHeight + 2

  const chart = useMemo(() => {
    if (!depthTimes.length || !depthValues.length) return null

    const depthScale = chooseDepthScale(Math.max(...depthValues))
    const ydiv = depthScale / h

    // Split padded tail (last 3 points) from real data
    const realTimes = padded ? depthTimes.slice(0, -3) : depthTimes
    const realValues = padded ? depthValues.slice(0, -3) : depthValues
    const padTimes = padded ? depthTimes.slice(-3) : []

    const xmax = Math.max(...depthTimes)

    // Map all points to pixel coords
    const toXY = (tMin: number, val: number) => ({
      x: boxRight - (xmax - tMin) / xdiv,
      y: y0 + Math.min(val / ydiv, h),
    })

    const allPts = depthTimes.map((t, i) => toXY(t, depthValues[i]))
    const realPts = realTimes.map((t, i) => toXY(t, realValues[i]))
    const padPts  = padTimes.map((t, i) => toXY(t, padded ? depthValues[depthValues.length - 3 + i] : 0))

    // Polygon: close at top-left and top-right
    const polyPts = [
      { x: allPts[0].x, y: y0 },
      ...allPts,
      { x: boxRight, y: y0 },
    ]
    const polyStr = polyPts.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ')

    // Freshness: stale if last real data is >1.25h old (rough threshold like auvstatus.py)
    const lastRealMs = Math.max(...realTimes) * 60 * 1000
    const ageHours = (nowMs - lastRealMs) / 3600000
    const isStale = ageHours > 1.25
    const polyColor = isStale ? '#f97316' : '#60a5fa'  // orange : blue
    const padColor  = isStale ? '#f97316' : '#93c5fd'

    // Pad polyline (the faked trailing segment shown in a lighter/different shade)
    let padPolyStr: string | null = null
    if (padded && padPts.length >= 2) {
      padPolyStr = padPts.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ')
    }

    // Grid lines
    const grids = [0.25, 0.5, 0.75].flatMap((frac) => [
      { x1: x0 + w * frac, y1: y0, x2: x0 + w * frac, y2: y0 + h }, // vertical
      { x1: x0, y1: y0 + h * frac, x2: x0 + w, y2: y0 + h * frac }, // horizontal
    ])
    const minorGridFracs = [0.125, 0.375, 0.625, 0.875]

    // Axis time labels: show hours remaining at 75/50/25/0% of window
    const axisLabels = [
      { frac: 0.25, label: `${((1 - 0.25) * windowMinutes / 60).toFixed(0)}h` },
      { frac: 0.50, label: `${((1 - 0.50) * windowMinutes / 60).toFixed(0)}h` },
      { frac: 0.75, label: `${((1 - 0.75) * windowMinutes / 60).toFixed(0)}h` },
    ]

    // Comms ticks — decimated to 2-pixel resolution
    const tickElems: React.ReactNode[] = []
    for (const [key, row] of Object.entries(tickRows)) {
      const positions = decimateTimes(row.times, nowMin, xdiv, boxRight)
      for (const hpos of positions) {
        if (hpos > x0 - 1) {
          tickElems.push(
            <rect
              key={`${key}-${hpos}`}
              x={hpos}
              y={row.y}
              width={2}
              height={tickRowHeight}
              fill={row.color}
            />
          )
        }
      }
    }

    // Last-data timestamp display
    const lastDataMs = Math.max(...realTimes) * 60 * 1000
    const timeLabel = fmtHoursMin(lastDataMs)
    const agoLabel = fmtAgo(lastDataMs - nowMs)

    return {
      polyStr,
      padPolyStr,
      polyColor,
      padColor,
      grids,
      minorGridFracs,
      axisLabels,
      tickElems,
      depthScale,
      timeLabel,
      agoLabel,
      isStale,
      realPts,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depthTimes, depthValues, celTimes, satTimes, gpsTimes, argoTimes, padded, w, h, windowMinutes])

  if (!chart) return null

  const {
    polyStr,
    padPolyStr,
    polyColor,
    padColor,
    grids,
    minorGridFracs,
    axisLabels,
    tickElems,
    depthScale,
    timeLabel,
    agoLabel,
    isStale,
  } = chart

  // SVG viewBox: x0=0, top accounting for tick rows, full width + right labels
  const viewBoxTop = y0 - tickAreaHeight - 2
  const viewBoxH = h + tickAreaHeight + 14  // +14 for axis labels below

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${x0 - 1} ${viewBoxTop} ${svgWidth} ${viewBoxH}`}
      width={svgWidth}
      height={viewBoxH}
      className={clsx('depth-sparkline', className)}
      style={style}
      aria-label="depth and comms history sparkline"
    >
      {/* Background box */}
      <rect x={x0} y={y0} width={w} height={h} fill="#d1d5db" />

      {/* Grid lines */}
      {grids.map((g, i) => (
        <line
          key={`grid-${i}`}
          x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
          stroke="#9ca3af" strokeWidth={0.3}
        />
      ))}
      {minorGridFracs.map((frac) => (
        <line
          key={`mgrid-v-${frac}`}
          x1={x0 + w * frac} y1={y0}
          x2={x0 + w * frac} y2={y0 + h}
          stroke="#9ca3af" strokeWidth={0.15}
        />
      ))}

      {/* Depth filled polygon */}
      <polygon points={polyStr} fill={polyColor} fillOpacity={0.85} stroke="none" />

      {/* Pad/extrapolated trailing segment */}
      {padPolyStr && (
        <polyline
          points={padPolyStr}
          fill="none"
          stroke={padColor}
          strokeWidth={0.8}
          strokeDasharray="2 1"
        />
      )}

      {/* Comms + GPS tick marks */}
      {tickElems}

      {/* Legend (to the right of the chart) */}
      <rect x={x0 + w + 4}  y={y0 - tickRowGap * 4} width={2} height={tickRowHeight} fill="#a855f7" />
      <text x={x0 + w + 7}  y={y0 - tickRowGap * 3 - 0.5} fontSize={3.5} fill="#374151">gps</text>
      <rect x={x0 + w + 18} y={y0 - tickRowGap * 4} width={2} height={tickRowHeight} fill="#3b82f6" />
      <text x={x0 + w + 21} y={y0 - tickRowGap * 3 - 0.5} fontSize={3.5} fill="#374151">argo</text>
      <rect x={x0 + w + 4}  y={y0 - tickRowGap * 2} width={2} height={tickRowHeight} fill="#22c55e" />
      <text x={x0 + w + 7}  y={y0 - tickRowGap - 0.5} fontSize={3.5} fill="#374151">cell</text>
      <rect x={x0 + w + 18} y={y0 - tickRowGap * 2} width={2} height={tickRowHeight} fill="#f97316" />
      <text x={x0 + w + 21} y={y0 - tickRowGap - 0.5} fontSize={3.5} fill="#374151">sat</text>

      {/* Axis time labels below the box */}
      {axisLabels.map(({ frac, label }) => (
        <text
          key={`ax-${frac}`}
          x={x0 - 2 + w * frac}
          y={y0 + h + 5}
          fontSize={3.5}
          fill="#6b7280"
          textAnchor="middle"
        >
          {label}
        </text>
      ))}

      {/* Max depth label (bottom-left inside box) */}
      <text x={x0 + 1} y={y0 + h - 1} fontSize={3.5} fill="#374151">
        {depthScale}m
      </text>

      {/* Freshness dot */}
      <circle
        cx={x0 + w + 2}
        cy={y0 + 3}
        r={2}
        fill={isStale ? '#9ca3af' : '#22c55e'}
      />

      {/* Last data time + age (right of box, below freshness dot) */}
      <text x={x0 + w + 2} y={y0 + 8} fontSize={3.5} fill="#374151">{timeLabel}</text>
      <text x={x0 + w + 2} y={y0 + 13} fontSize={3.5} fill="#6b7280">{agoLabel}</text>
    </svg>
  )
}

DepthSparkline.displayName = 'Charts.DepthSparkline'

export default DepthSparkline
