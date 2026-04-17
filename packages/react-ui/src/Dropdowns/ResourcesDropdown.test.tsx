import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ResourcesDropdown, ResourcesDropdownProps } from './ResourcesDropdown'

const picLinks = [{ label: 'Watchbill', url: 'https://example.com/watchbill' }]
const resourceLinks = [
  { label: 'LRAUV Watchbill Signup', url: 'https://example.com/watchbill' },
]
const trainingLinks = [
  { label: 'PIC Training (Formative)', url: 'https://example.com/training' },
]
const adminLinks = [
  { label: 'Frontend Settings', url: 'https://example.com/admin' },
]

// All sections expanded — used by most existing tests so they can see links
const allExpanded: ResourcesDropdownProps['defaultExpandedSections'] = [
  'pic',
  'resources',
  'training',
  'admin',
]

const props: ResourcesDropdownProps = {
  picLinks,
  resourceLinks,
  trainingLinks,
  adminLinks,
  defaultExpandedSections: allExpanded,
}

const triggerButton = () =>
  screen.getByRole('button', { name: /LRAUV Resources/i })

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

test('should render resource links when panel and section are open', () => {
  render(<ResourcesDropdown {...props} />)
  fireEvent.click(triggerButton())
  expect(screen.getByText('LRAUV Watchbill Signup')).toBeInTheDocument()
  expect(screen.getByTestId('resource-link-0')).toHaveAttribute(
    'href',
    'https://example.com/watchbill'
  )
})

test('should render training links when panel and section are open', () => {
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

// --- Collapsible section behaviour ---

test('PIC section is expanded by default, other sections collapsed', () => {
  render(
    <ResourcesDropdown
      picLinks={picLinks}
      resourceLinks={resourceLinks}
      trainingLinks={trainingLinks}
    />
  )
  fireEvent.click(triggerButton())
  // PIC link visible (expanded by default)
  expect(screen.getByText('Watchbill')).toBeInTheDocument()
  // Resources link hidden (collapsed by default)
  expect(screen.queryByText('LRAUV Watchbill Signup')).not.toBeInTheDocument()
  // Training link hidden (collapsed by default)
  expect(screen.queryByText('PIC Training (Formative)')).not.toBeInTheDocument()
})

test('clicking a collapsed section header expands it', () => {
  render(
    <ResourcesDropdown
      resourceLinks={resourceLinks}
      defaultExpandedSections={[]}
    />
  )
  fireEvent.click(triggerButton())
  expect(screen.queryByText('LRAUV Watchbill Signup')).not.toBeInTheDocument()

  fireEvent.click(screen.getByTestId('resource-link-header'))
  expect(screen.getByText('LRAUV Watchbill Signup')).toBeInTheDocument()
})

test('clicking an expanded section header collapses it', () => {
  render(
    <ResourcesDropdown
      resourceLinks={resourceLinks}
      defaultExpandedSections={['resources']}
    />
  )
  fireEvent.click(triggerButton())
  expect(screen.getByText('LRAUV Watchbill Signup')).toBeInTheDocument()

  fireEvent.click(screen.getByTestId('resource-link-header'))
  expect(screen.queryByText('LRAUV Watchbill Signup')).not.toBeInTheDocument()
})

test('section header buttons have correct aria-expanded attribute', () => {
  render(
    <ResourcesDropdown
      resourceLinks={resourceLinks}
      defaultExpandedSections={['resources']}
    />
  )
  fireEvent.click(triggerButton())
  const header = screen.getByTestId('resource-link-header')
  expect(header).toHaveAttribute('aria-expanded', 'true')

  fireEvent.click(header)
  expect(header).toHaveAttribute('aria-expanded', 'false')
})
