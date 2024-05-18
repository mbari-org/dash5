import { atom, useRecoilState } from 'recoil'

export type ModalId =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'reassign'
  | 'newDeployment'
  | 'editDeployment'
  | 'sendNote'
  | 'espSamples'
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
  | 'color'
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
