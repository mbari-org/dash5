// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from '../getInstance'
import { RequestConfig } from '../types'

export interface GetPreviewParams {
  vehicle: string
  commandText: string
  schedId?: string
  schedDate?: string
}

interface PreviewResult {
  line: string
  href: string
}

export interface GetPreviewResponse {
  result: PreviewResult[]
}

/** Each preview line is one outgoing SBD fragment from the backend. */
export const countPreviewSbdChunks = (
  preview?: GetPreviewResponse | null
): number => preview?.result?.length ?? 0

export const getPreview = async (
  params: GetPreviewParams,
  { debug, instance = getInstance(), ...config }: RequestConfig = {}
) => {
  const url = '/commands/preview'

  if (debug) {
    console.debug(`GET ${url}`)
  }

  // Drop undefined/null query params (URLSearchParams stringifies them as "undefined")
  const query = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  ) as Record<string, string>

  const response = await instance.get(
    `${url}?${new URLSearchParams(query)}`,
    config
  )
  return response.data as GetPreviewResponse
}
