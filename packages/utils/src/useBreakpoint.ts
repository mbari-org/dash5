import { useWindowSize } from './useWindowSize'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface IBreakpoints {
  [key: string]: number
}

const breakpoints: IBreakpoints = {
  xs: 375,
  sm: 544,
  md: 768,
  lg: 992,
  xl: 1200,
}

export const useBreakpoint = (): Breakpoint[] => {
  const { width } = useWindowSize()

  const viewPorts: Breakpoint[] = Object.keys(breakpoints).filter(
    (key) => breakpoints[key] <= width
  ) as Breakpoint[]

  return viewPorts
}
