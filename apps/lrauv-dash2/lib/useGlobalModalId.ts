import { atom, useRecoilState } from 'recoil'

export type ModalId =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'reassign'
  | 'newDeployment'
  | 'editDeployment'
  | 'sendNote'
  | 'esbSamples'
  | 'editDocument'
  | 'attachDocument'
  | 'detachDocument'
  | 'newMission'
  | 'newCommand'
  | null

export interface GlobalModalMetaData {
  docId?: number | null
  docInstanceId?: number | null
  deploymentId?: number | null
  vehicleName?: string | null
  deploymentName?: string | null
  documentName?: string | null
  duplicate?: boolean
  attachmentType?: 'deployment' | 'vehicle'
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
