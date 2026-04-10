import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResourcesDropdown, ResourcesDropdownProps } from './ResourcesDropdown'

const resourceLinks = [
  { label: 'LRAUV Watchbill Signup', url: 'https://example.com/watchbill' },
]
const trainingLinks = [
  { label: 'PIC Training (Formative)', url: 'https://example.com/training' },
]
const adminLinks = [
  { label: 'Frontend Settings', url: 'https://example.com/admin' },
]

const props: ResourcesDropdownProps = {
  resourceLinks,
  trainingLinks,
  adminLinks,
}

const triggerButton = () => screen.getByRole('button', { name: /Resources/i })

test('should render the resources trigger button', () => {
  render(<ResourcesDropdown {...props} />)
  expect(screen.getByTestId('resources-button')).toBeInTheDocument()
  expect(triggerButton()).toBeInTheDocument()
})

test('should not show the panel by default', () => {
  render(<ResourcesDropdown {...props} />)
  expect(screen.queryByTestId('resources-panel')).not.toBeInTheDocument()
})

test('should open the panel when the trigger is clicked', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByTestId('resources-panel')).toBeInTheDocument()
})

test('should close the panel when Escape is pressed', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByTestId('resources-panel')).toBeInTheDocument()
  fireEvent.keyDown(screen.getByTestId('resources-panel'), { key: 'Escape' })
  expect(screen.queryByTestId('resources-panel')).not.toBeInTheDocument()
})

test('should toggle the panel closed when trigger is clicked again', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByTestId('resources-panel')).toBeInTheDocument()
  fireEvent.click(triggerButton())
  expect(screen.queryByTestId('resources-panel')).not.toBeInTheDocument()
})

test('should render resource links when panel is open', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByText('LRAUV Watchbill Signup')).toBeInTheDocument()
  expect(screen.getByTestId('resource-link-0')).toHaveAttribute(
    'href',
    'https://example.com/watchbill'
  )
})

test('should render training links when panel is open', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByText('PIC Training (Formative)')).toBeInTheDocument()
  expect(screen.getByTestId('training-link-0')).toHaveAttribute(
    'href',
    'https://example.com/training'
  )
})

test('should open all links in a new tab', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByTestId('resource-link-0')).toHaveAttribute(
    'target',
    '_blank'
  )
  expect(screen.getByTestId('training-link-0')).toHaveAttribute(
    'target',
    '_blank'
  )
})

test('should not render admin section for non-admin users', () => {
  render(<ResourcesDropdown {...props} isAdmin={false} />)
  fireEvent.click(triggerButton())
  expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument()
  expect(screen.queryByTestId('admin-link-0')).not.toBeInTheDocument()
})

test('should render admin section for admin users', () => {
  render(<ResourcesDropdown {...props} isAdmin={true} />)
  fireEvent.click(triggerButton())
  expect(screen.getByText(/Admin Settings/i)).toBeInTheDocument()
  expect(screen.getByTestId('admin-link-0')).toBeInTheDocument()
  expect(screen.getByText('Frontend Settings')).toBeInTheDocument()
})

test('should show empty state when no links are configured', () => {
  render(<ResourcesDropdown />)
  fireEvent.click(triggerButton())
  expect(screen.getByText('No resources configured.')).toBeInTheDocument()
})

test('should have correct rel attribute on external links', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByTestId('resource-link-0')).toHaveAttribute(
    'rel',
    'noopener noreferrer'
  )
})

test('should render section headers when panel is open', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  const panel = screen.getByTestId('resources-panel')
  expect(within(panel).getByText('Resources')).toBeInTheDocument()
  expect(within(panel).getByText('Training')).toBeInTheDocument()
})
