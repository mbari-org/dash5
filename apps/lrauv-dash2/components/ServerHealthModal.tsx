import { Modal } from '@mbari/react-ui'
import { useHealth, useSubscribers } from '@mbari/api-client'
import { DateTime } from 'luxon'

export interface ServerHealthModalProps {
  onClose?: () => void
}

const MB = 1024 * 1024

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-800">{value}</span>
  </div>
)

const ServerHealthModal: React.FC<ServerHealthModalProps> = ({ onClose }) => {
  const { data: health, isLoading: healthLoading, dataUpdatedAt } = useHealth()
  const { data: subscribers, isError: subscribersError } = useSubscribers()

  const usedMemoryMb = health
    ? Math.round((health.totalMemory - health.freeMemory) / MB)
    : null
  const totalMemoryMb = health ? Math.round(health.totalMemory / MB) : null
  const maxMemoryMb = health ? Math.round(health.maxMemory / MB) : null

  const lastUpdated = dataUpdatedAt
    ? DateTime.fromMillis(dataUpdatedAt).toFormat('HH:mm:ss')
    : null

  const subscriberEntries = subscribers ? Object.entries(subscribers) : []

  return (
    <Modal
      title="Server Status"
      onClose={onClose}
      open
      style={{ minWidth: 420 }}
    >
      <div className="p-4">
        {healthLoading && !health && (
          <p className="text-center text-sm text-slate-500">Loading...</p>
        )}
        {health && (
          <>
            <div className="mb-4 rounded-lg bg-slate-50 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Sessions
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-violet-700">
                  {health.asyncConnections}
                </span>
                <span className="text-sm text-slate-500">
                  WebSocket connection
                  {health.asyncConnections !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Each browser tab counts as one connection.
              </p>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Connected Users
              </div>
              {subscribersError && (
                <p className="text-xs text-amber-600">
                  Connected users require operator or admin role in TethysDash.
                </p>
              )}
              {!subscribersError && subscriberEntries.length === 0 && (
                <p className="text-xs text-slate-400">
                  No user data available.
                </p>
              )}
              {subscriberEntries.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded border border-slate-100">
                  {subscriberEntries.map(([email, info]) => (
                    <div
                      key={email}
                      className="border-b border-slate-100 px-3 py-2 last:border-0"
                    >
                      <div className="mb-1 text-sm font-medium text-slate-700">
                        {email}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {info.sessions.map((s, i) => {
                          const tduiv = s.tduiv ?? 'unknown'
                          const majorVersion = parseInt(
                            tduiv.split('.')[0] ?? '0',
                            10
                          )
                          const isDash5 = tduiv === 'dev' || majorVersion >= 5
                          return (
                            <span
                              key={i}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                isDash5
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {isDash5
                                ? `Dash5 (${tduiv})`
                                : `Dash4 (${tduiv})`}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Server Memory
              </div>
              <Stat
                label="Used"
                value={`${usedMemoryMb} MB / ${totalMemoryMb} MB`}
              />
              <Stat label="Max heap" value={`${maxMemoryMb} MB`} />
              <Stat label="CPU cores" value={health.availableProcessors} />
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Build Info
              </div>
              <Stat label="Application" value={health.application} />
              <Stat label="Version" value={health.version} />
              <Stat label="Build" value={health.build} />
              <Stat label="Java" value={health.javaVersion} />
            </div>

            {lastUpdated && (
              <p className="mt-3 text-right text-xs text-slate-400">
                Last updated {lastUpdated} · refreshes every 30s
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default ServerHealthModal
