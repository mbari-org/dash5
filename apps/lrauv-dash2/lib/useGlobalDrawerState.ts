import { atom, useRecoilState } from 'recoil'

const globalDrawerState = atom<boolean>({
  key: 'globalDrawerState',
  default: true,
})

const useGlobalDrawerState = () => {
  const [drawerOpen, setDrawerOpen] = useRecoilState(globalDrawerState)

  return {
    drawerOpen,
    setDrawerOpen,
  }
}

export default useGlobalDrawerState
