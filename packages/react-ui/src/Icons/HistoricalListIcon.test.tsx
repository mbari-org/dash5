import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  HistoricalListIcon,
  HistoricalListIconProps,
} from './HistoricalListIcon'

const props: HistoricalListIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<HistoricalListIcon {...props} />)).not.toThrow()
})
