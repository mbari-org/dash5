import Link from 'next/link'
import {
  useAttachDocumentToDeployment,
  useAttachDocumentToVehicle,
  useDetachDocumentToDeployment,
  useDetachDocumentToVehicle,
  useDocuments,
} from '@mbari/api-client'

export default function DocsIndexPage() {
  const { data, isLoading } = useDocuments()
  const attachVehicle = useAttachDocumentToVehicle()
  const detachVehicle = useDetachDocumentToVehicle()
  const attachDeployment = useAttachDocumentToDeployment()
  const detachDeployment = useDetachDocumentToDeployment()

  const handleAttachVehicle = async (docId?: number) => {
    if (!docId) return
    const vehicleName = window.prompt('Vehicle name?')
    if (!vehicleName) return
    await attachVehicle.mutateAsync({ docId, vehicleName })
  }
  const handleDetachVehicle = async (docId?: number) => {
    if (!docId) return
    const vehicleName = window.prompt('Vehicle name to detach?')
    if (!vehicleName) return
    await detachVehicle.mutateAsync({ docId, vehicleName })
  }
  const handleAttachDeployment = async (docId?: number) => {
    if (!docId) return
    const dep = window.prompt('Deployment ID?')
    if (!dep) return
    await attachDeployment.mutateAsync({ docId, deploymentId: Number(dep) })
  }
  const handleDetachDeployment = async (docId?: number) => {
    if (!docId) return
    const dep = window.prompt('Deployment ID to detach?')
    if (!dep) return
    await detachDeployment.mutateAsync({ docId, deploymentId: Number(dep) })
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Documents</h1>
      <div style={{ margin: '8px 0' }}>
        <Link href="/docs/new">Add document</Link>
      </div>
      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Latest</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((d) => (
              <tr key={String(d.docId)}>
                <td>
                  <Link href={`/docs/${d.docId}`}>{d.docId}</Link>
                </td>
                <td>{d.name}</td>
                <td>{d.docType}</td>
                <td>
                  {d.latestRevision?.unixTime
                    ? new Date(
                        d.latestRevision.unixTime * 1000
                      ).toLocaleString()
                    : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => handleAttachVehicle(d.docId)}>
                      Attach vehicle
                    </button>
                    <button onClick={() => handleDetachVehicle(d.docId)}>
                      Detach vehicle
                    </button>
                    <button onClick={() => handleAttachDeployment(d.docId)}>
                      Attach deployment
                    </button>
                    <button onClick={() => handleDetachDeployment(d.docId)}>
                      Detach deployment
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
