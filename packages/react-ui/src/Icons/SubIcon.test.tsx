import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SubIcon, SubIconProps } from './SubIcon'

const props: SubIconProps = {}

test('should render the icon', async () => {
  expect(() => render(<SubIcon {...props} />)).not.toThrow()
})
