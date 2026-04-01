import React from 'react'

// High-contrast on blue/grey bathymetric maps (replaces purple #7e22ce)
export const WAYPOINT_ICON_COLOR = '#ea580c' // orange-600

const W = 22
const H = 32

export interface WaypointIconProps {
  number: number
  color?: string
}

/**
 * Upside-down teardrop (location pin) with number centered in the round top 2/3.
 * Uses flexbox so single and double digits stay centered.
 */
const WaypointIcon: React.FC<WaypointIconProps> = ({
  number,
  color = WAYPOINT_ICON_COLOR,
}) => (
  <div
    style={{
      position: 'relative',
      width: W,
      height: H,
    }}
  >
    <svg
      width={W}
      height={H}
      viewBox="0 0 28 40"
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}
    >
      <path
        d="M14 0 C6.3 0 0 6.3 0 14 C0 24.5 14 40 14 40 S28 24.5 28 14 C28 6.3 21.7 0 14 0 Z"
        fill={color}
      />
    </svg>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '66%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          color: 'white',
          fontWeight: 700,
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        {number}
      </span>
    </div>
  </div>
)

export default WaypointIcon
