import { atom, useRecoilState } from 'recoil'

export type ModalId =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'reassign'
  | 'newDeployment'
  | 'sendNote'
  | null

const globalModalState = atom<ModalId>({
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
