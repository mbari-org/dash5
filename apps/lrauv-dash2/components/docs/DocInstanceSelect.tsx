import { DateTime } from 'luxon'

export interface DocInstanceSelectProps {
  // Minimal shape used by the UI; matches API client type
  instances: {
    docInstanceId?: number
    unixTime?: number
    user?: string
  }[]
  value?: string
  onChange: (docInstanceId: string) => void
  latestDocInstanceId?: number
}

export default function DocInstanceSelect(props: DocInstanceSelectProps) {
  const { instances, value, onChange, latestDocInstanceId } = props
  const sorted = [...instances].sort(
    (a, b) => (b.unixTime ?? 0) - (a.unixTime ?? 0)
  )

  // Determine latest revision ID if not provided (use highest timestamp)
  const latestId =
    latestDocInstanceId ??
    sorted[0]?.docInstanceId ??
    instances.reduce(
      (latest, current) =>
        (current.unixTime ?? 0) > (latest.unixTime ?? 0) ? current : latest,
      instances[0]
    )?.docInstanceId

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-stone-300 bg-white px-2 py-1 text-sm focus:border-stone-400 focus:outline-none"
    >
      {sorted.map((i) => {
        const isLatest = i.docInstanceId === latestId
        const timestamp = i.unixTime
          ? DateTime.fromMillis(i.unixTime).toLocaleString(
              DateTime.DATETIME_MED
            )
          : 'Unknown date'

        return (
          <option key={String(i.docInstanceId)} value={String(i.docInstanceId)}>
            {timestamp} {i.user ? `– ${i.user}` : ''}
            {isLatest ? ' (latest)' : ''}
          </option>
        )
      })}
    </select>
  )
}
