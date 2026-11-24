import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandModalView, CommandModalViewProps } from './CommandModalView'
import { syntaxVariations, commands } from './CommandModalView.sampleProps'
import userEvent from '@testing-library/user-event'

const props: CommandModalViewProps = {
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
  expect(() => render(<CommandModalView {...props} />)).not.toThrow()
})

test('should display command names', async () => {
  render(<CommandModalView {...props} />)
  expect(screen.queryByText(props.commands[0].name)).toBeInTheDocument()
})

test('should display command descriptions', async () => {
  render(<CommandModalView {...props} />)
  expect(
    screen.queryByText(`${props.commands[1].description}`)
  ).toBeInTheDocument()
})

test('should display vehicle name in teal', async () => {
  render(<CommandModalView {...props} />)
  expect(screen.queryByTestId(/vehicle name/i)).toHaveClass('text-teal-500')
})

test('should display progress bar steps', async () => {
  render(<CommandModalView {...props} />)
  const stepLabels = props.steps.map((step, index) => `${index + 1}. ${step}`)
  expect(screen.queryAllByText(stepLabels[0])[0]).toBeInTheDocument()
  expect(screen.queryAllByText(stepLabels[1])[0]).toBeInTheDocument()
  expect(screen.queryAllByText(stepLabels[2])[0]).toBeInTheDocument()
})

// Step 1 tests
test('should display template commands placeholder text', async () => {
  render(<CommandModalView {...props} />)
  expect(screen.queryByText(/template/i)).toBeInTheDocument()
})

test('should display search commands placeholder text', async () => {
  render(<CommandModalView {...props} />)
  expect(screen.queryByPlaceholderText(/search commands/i)).toBeInTheDocument()
})

// Step 3 tests
test('should render command', () => {
  render(<CommandModalView {...props} currentStepIndex={2} />)

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
  render(<CommandModalView {...props} currentStepIndex={2} />)

  expect(screen.getByText(props.vehicleName)).toBeInTheDocument()
})

test('should render extra buttons and correct button text', () => {
  render(
    <CommandModalView
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
    <CommandModalView
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

test('command confirmation Cancel dismisses and Back sits beside Confirm', async () => {
  const user = userEvent.setup()
  const onCancel = jest.fn()
  render(
    <CommandModalView {...props} currentStepIndex={3} onCancel={onCancel} />
  )

  const back = screen.getByRole('button', { name: 'Back' })
  const confirm = screen.getByRole('button', { name: /^Confirm$/i })
  const cancel = screen.getByRole('button', { name: /^Cancel$/i })
  expect(back.closest('li')).toBe(confirm.closest('li'))
  expect(cancel.closest('li')).not.toBe(back.closest('li'))

  await user.click(cancel)
  expect(onCancel).toHaveBeenCalledTimes(1)
})

test('command confirmation Back returns to Schedule and does not dismiss', async () => {
  const user = userEvent.setup()
  const onCancel = jest.fn()
  render(
    <CommandModalView {...props} currentStepIndex={3} onCancel={onCancel} />
  )

  await user.click(screen.getByRole('button', { name: 'Back' }))
  expect(onCancel).not.toHaveBeenCalled()
  expect(screen.queryByText(/is that right/i)).not.toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: `Schedule ${props.vehicleName}` })
  ).toBeInTheDocument()
})

test('defaultCommand flow: advancing from Build through Schedule to Confirm', async () => {
  // Regression test for "Use for new command" — the modal starts at step 1 (Build)
  // with a pre-filled command. The old gate checked step === 1 only, so clicking
  // Next on the Schedule step (step 2) silently did nothing.
  const user = userEvent.setup()
  var scheduledText = ''
  render(
    <CommandModalView
      {...props}
      selectedId={undefined}
      currentStepIndex={1}
      defaultCommand="failComponent"
      onSchedule={(args) => {
        scheduledText = args.commandText
      }}
    />
  )

  // Should start at Build step with command pre-filled in freeform textarea
  const textarea = screen.getByRole('textbox')
  expect(textarea).toBeInTheDocument()
  expect(textarea).toHaveValue('failComponent')

  // Advance from Build (step 1) to Schedule (step 2)
  await user.click(screen.getByText(/next/i).closest('button') as Element)
  expect(screen.getByText(/failComponent/i)).toBeInTheDocument()
  expect(screen.getByText(/Brizo/i, { selector: 'span' })).toBeInTheDocument()

  // Advance from Schedule (step 2) to ConfirmVehicleDialog (step 3)
  await user.click(
    screen.getByText(/Schedule Brizo/i).closest('button') as Element
  )
  expect(screen.getByText(/Brizo should do failComponent/i)).toBeInTheDocument()

  // Confirm and verify the command was sent
  await user.click(screen.getByText(/confirm/i).closest('button') as Element)
  expect(scheduledText).toBe('failComponent')
})
