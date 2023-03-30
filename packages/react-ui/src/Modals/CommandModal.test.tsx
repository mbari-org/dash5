import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandModal, CommandModalProps } from './CommandModal'
import { syntaxVariations, commands } from './CommandModal.sampleProps'
import userEvent from '@testing-library/user-event'

const props: CommandModalProps = {
  steps: ['Command', 'Build', 'Schedule'],
  currentStepIndex: 0,
  vehicleName: 'Brizo',
  recentCommands: [
    {
      id: 'restart',
      name: 'restart logs',
    },
    {
      id: 'stop',
      name: 'stop',
    },
    {
      id: 'schedule resume',
      name: 'schedule clear; schedule resume',
    },
  ],
  onCancel: () => console.log('cancel'),
  commands,
  syntaxVariations,
  onSortColumn: (col, isAsc) => {
    console.log(
      `Clicked column number ${col}, which is sorted ${
        isAsc ? 'ascending' : 'descending'
      }`
    )
  },
  onSchedule: async (values) => {
    console.log(values)
    return undefined
  },
  selectedId: 'failComponent',
}

test('should render the component', async () => {
  expect(() => render(<CommandModal {...props} />)).not.toThrow()
})

test('should display command names', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByText(props.commands[0].name)).toBeInTheDocument()
})

test('should display command descriptions', async () => {
  render(<CommandModal {...props} />)
  expect(
    screen.queryByText(`${props.commands[1].description}`)
  ).toBeInTheDocument()
})

test('should display vehicle name in teal', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByTestId(/vehicle name/i)).toHaveClass('text-teal-500')
})

test('should display progress bar steps', async () => {
  render(<CommandModal {...props} />)
  const stepLabels = props.steps.map((step, index) => `${index + 1}. ${step}`)
  expect(screen.queryAllByText(stepLabels[0])[0]).toBeInTheDocument()
  expect(screen.queryAllByText(stepLabels[1])[0]).toBeInTheDocument()
  expect(screen.queryAllByText(stepLabels[2])[0]).toBeInTheDocument()
})

// Step 1 tests
test('should display template commands placeholder text', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByText(/template/i)).toBeInTheDocument()
})

test('should display search commands placeholder text', async () => {
  render(<CommandModal {...props} />)
  expect(screen.queryByPlaceholderText(/search commands/i)).toBeInTheDocument()
})

// Step 3 tests
test('should render command', () => {
  render(<CommandModal {...props} currentStepIndex={2} />)

  const selectedCommand =
    props?.commands?.find((command) => command?.id === props?.selectedId)
      ?.name ?? ''

  if (selectedCommand) {
    expect(screen.getByText(selectedCommand)).toBeInTheDocument()
  } else {
    console.log('invalid selected id')
    expect(true).toBe(false)
  }
})

test('should render vehicle name', () => {
  render(<CommandModal {...props} currentStepIndex={2} />)

  expect(screen.getByText(props.vehicleName)).toBeInTheDocument()
})

test('should render extra buttons and correct button text', () => {
  render(
    <CommandModal
      {...props}
      currentStepIndex={2}
      alternativeAddresses={['one@example.com', 'two@example.com']}
    />
  )

  expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Submit to alternative address' })
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: `Schedule ${props.vehicleName}` })
  ).toBeInTheDocument()
})

test('should schedule a complete command without making any changes to the default values', async () => {
  const user = userEvent.setup()
  var commandText = ''
  render(
    <CommandModal
      {...props}
      onSchedule={(args) => {
        commandText = args.commandText
      }}
    />
  )
  // Navigate to failComponent for step 2
  await user.click(screen.getByPlaceholderText(/search commands/i))
  await user.type(screen.getByPlaceholderText(/search commands/i), 'fail')
  await user.click(
    screen.getByText('failComponent').closest('button') as Element
  )
  await user.click(screen.getByText(/next/i).closest('button') as Element)
  expect(screen.getByText(/Build command/i)).toBeInTheDocument()
  expect(screen.queryAllByText(/failComponent/i).length).toBe(2)

  // Navigate to step 3
  await user.click(screen.getByText(/next/i).closest('button') as Element)
  expect(screen.getByText(/failComponent/i)).toBeInTheDocument()
  expect(screen.getByText(/Brizo/i, { selector: 'span' })).toBeInTheDocument()

  // Schedule command
  await user.click(
    screen.getByText(/Schedule Brizo/i).closest('button') as Element
  )
  expect(screen.getByText(/Brizo should do failComponent/i)).toBeInTheDocument()

  // Confirm schedule
  await user.click(screen.getByText(/confirm/i).closest('button') as Element)
  expect(commandText).toBe('failComponent')
})
