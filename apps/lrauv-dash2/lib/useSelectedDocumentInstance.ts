import { atom, useRecoilState } from 'recoil'

const selectedDocumentInstanceState = atom<{
  docInstanceId?: number | null
  duplicate?: boolean
} | null>({
  key: 'selectedDocumentInstanceState',
  default: null,
})

const useSelectedDocumentInstance = () => {
  const [selectedDocumentInstance, setSelectedDocumentInstance] =
    useRecoilState(selectedDocumentInstanceState)

  return {
    selectedDocumentInstance,
    setSelectedDocumentInstance,
  }
}

export default useSelectedDocumentInstance
