import { atom, useRecoilState } from 'recoil'
import type { NewDocRequest } from '../components/docs/types/docTypes'

export type ModalId =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'reassign'
  | 'newDeployment'
  | 'editDeployment'
  | 'sendNote'
  | 'espSamples'
  | 'addDocument'
  | 'editDocument'
  | 'attachDocument'
  | 'detachDocument'
  | 'newMission'
  | 'newCommand'
  | 'vehicleLogs'
  | 'vehicleDocs'
  | 'vehicleCharts'
  | 'vehicleComms'
  | 'battery'
  | 'scheduleEventDetails'
  | 'color'
  | 'emailNotifications'
  | null

export interface GlobalModalMetaData {
  docId?: number | null
  docInstanceId?: number | null
  deploymentId?: number | null
  vehicleName?: string | null
  color?: string | null
  deploymentName?: string | null
  documentName?: string | null
  duplicate?: boolean
  attachmentType?: 'deployment' | 'vehicle'
  eventId?: number | null
  command?: string | null
  mission?: string | null
  params?: string | null
  newDocRequest?: NewDocRequest
  eventData?: string | null
  eventUser?: string | null
  eventNote?: string | null
  eventIsoTime?: string | null
  eventVehicleName?: string | null
  scheduleEvent?: {
    eventId: number
    commandType: 'mission' | 'command'
    status: string
    label: string
    secondary?: string
    user?: string
    note?: string
    eventData?: string
    eventText?: string
    startedAt?: number
    endedAt?: number
    vehicleName?: string
    scheduleDate?: string
    via?: 'cell' | 'sat' | 'cellsat'
    isParamUpdate?: boolean
    /** Raw comms status from the Comms Queue — 'queued'|'sent'|'ack'|'timeout' */
    commsStatus?: string
  } | null
}

export interface GlobalModalState {
  id: ModalId
  meta?: GlobalModalMetaData
}

const globalModalState = atom<GlobalModalState | null>({
  key: 'globalModalState',
  default: null,
})

const useGlobalModalId = () => {
  const [globalModalId, setGlobalModalId] = useRecoilState(globalModalState)

  return {
    globalModalId,
    setGlobalModalId,
  }
}

export default useGlobalModalId
