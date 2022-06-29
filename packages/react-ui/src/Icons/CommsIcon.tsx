import React from 'react'

export interface CommsIconProps {
  className?: string
  style?: React.CSSProperties
}

export const CommsIcon: React.FC<CommsIconProps> = ({ className, style }) => {
  return (
    <svg
      width="40"
      height="26"
      viewBox="0 0 40 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M13.8398 24.5H8.83013C8.12677 24.5 7.6432 23.7931 7.89813 23.1375L11.335 14.3L14.7718 23.1375C15.0267 23.7931 14.5431 24.5 13.8398 24.5Z"
        stroke="#929292"
        strokeWidth="2"
      />
      <ellipse cx="11.3351" cy="11.8714" rx="1.7" ry="1.45714" fill="#929292" />
      <path
        d="M15.3018 9.44281L15.3784 9.70567C15.6984 10.8028 15.6984 11.9685 15.3784 13.0657L15.3018 13.3285"
        stroke="#929292"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15.3018 9.44281L15.3784 9.70567C15.6984 10.8028 15.6984 11.9685 15.3784 13.0657L15.3018 13.3285"
        stroke="#929292"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.36829 13.3285L7.29162 13.0657C6.97162 11.9685 6.97162 10.8028 7.29162 9.70567L7.36829 9.44281"
        stroke="#929292"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.7017 7.5L19.2026 9.00263C19.6131 10.2342 19.6131 11.5658 19.2026 12.7974L18.7017 14.3"
        stroke="#929292"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3.96844 14.3L3.46757 12.7974C3.05703 11.5658 3.05703 10.2342 3.46757 9.00262L3.96845 7.49999"
        stroke="#929292"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M1.83502 7.5L18.835 24.5"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="21.0434"
        y="14"
        width="3"
        height="11"
        rx="0.5"
        stroke="#929292"
      />
      <rect
        x="26.0434"
        y="10"
        width="3"
        height="15"
        rx="0.5"
        stroke="#929292"
      />
      <rect x="31.0434" y="5" width="3" height="20" rx="0.5" stroke="#929292" />
      <rect x="36.0434" y="1" width="3" height="24" rx="0.5" stroke="#929292" />
    </svg>
  )
}

CommsIcon.displayName = 'Icons.CommsIcon'
