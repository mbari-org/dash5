import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  CommandDetailTable,
  CommandDetailProps,
  getValues,
  scopedValues,
  OptionSet,
  scopedSelectOptions,
} from './CommandDetailTable'

const props: CommandDetailProps = {
  parameters: [
    {
      name: 'Module',
      description: 'Description of a module',
      value: 'Science',
      inputType: 'string',
      argType: 'ARG_VARIABLE',
      options: [{ name: 'Module', options: ['Science', 'Alchemy'] }],
    },
    {
      name: 'Persist',
      inputType: 'boolean',
      argType: 'ARG_KEYWORD',
      description: 'Description of a unit',
    },
  ],
  onSelect: (param, value) => console.log(`param: ${param}  value: ${value}`),
}

test('should render the component', async () => {
  expect(() => render(<CommandDetailTable {...props} />)).not.toThrow()
})

test('should display the command name', async () => {
  render(<CommandDetailTable {...props} />)

  expect(screen.getByText(props.parameters[0].name)).toBeInTheDocument()
})

test('should display the command description', async () => {
  render(<CommandDetailTable {...props} />)

  expect(screen.getByText(props.parameters[0].description)).toBeInTheDocument()
})

test('should display the pre-populated value in the dropdown if provided', async () => {
  render(<CommandDetailTable {...props} />)

  expect(
    screen.queryByDisplayValue(`${props.parameters[0].value}`)
  ).toBeInTheDocument()
})

test('should display a checkbox if no parameter options are provided', async () => {
  render(<CommandDetailTable {...props} />)

  expect(screen.queryByRole('checkbox')).toBeInTheDocument()
})

describe('getValues', () => {
  test('should extract the values', async () => {
    const values = getValues(
      'Module____Control::::Component____LoopControl::::Element____stdDeviation'
    )

    expect(values).toEqual(['Control', 'LoopControl', 'stdDeviation'])
  })
})

describe('scopedValues', () => {
  test('should extract the values', async () => {
    const values = scopedValues(
      'Module____Control::::Component____LoopControl::::Element____stdDeviation'
    )

    expect(values).toEqual([
      'Module____Control',
      'Module____Control::::Component____LoopControl',
      'Module____Control::::Component____LoopControl::::Element____stdDeviation',
    ])
  })
})

describe('scopedSelectOptions', () => {
  const optionSets: OptionSet[] = [
    {
      name: 'Module',
      options: ['Science', 'Control'],
    },
    {
      name: 'Component',
      options: ['LoopControl', 'StandardControl'],
    },
    {
      name: 'Element',
      options: ['stdDeviation', 'mean'],
    },
  ]

  test('should only extract an option set for the first level if no value is present', async () => {
    const testValue = ''
    const values = scopedSelectOptions(testValue, optionSets)

    expect(values).toEqual([
      {
        name: 'Module',
        value: undefined,
        options: [
          { id: 'Module____Science', name: 'Science' },
          { id: 'Module____Control', name: 'Control' },
        ],
      },
    ])
  })

  test('should only extract the sets for the first two levels if only the first option is selected', async () => {
    const testValue = 'Module____Control'
    const values = scopedSelectOptions(testValue, optionSets)

    expect(values).toEqual([
      {
        name: 'Module',
        value: 'Module____Control',
        options: [
          { id: 'Module____Science', name: 'Science' },
          { id: 'Module____Control', name: 'Control' },
        ],
      },
      {
        name: 'Component',
        value: undefined,
        options: [
          {
            id: 'Module____Control::::Component____LoopControl',
            name: 'LoopControl',
          },
          {
            id: 'Module____Control::::Component____StandardControl',
            name: 'StandardControl',
          },
        ],
      },
    ])
  })

  test('should extract the sets for all three levels if the first two options are selected', async () => {
    const testValue = 'Module____Control::::Component____LoopControl'
    const values = scopedSelectOptions(testValue, optionSets)

    expect(values).toEqual([
      {
        name: 'Module',
        value: 'Module____Control',
        options: [
          { id: 'Module____Science', name: 'Science' },
          { id: 'Module____Control', name: 'Control' },
        ],
      },
      {
        name: 'Component',
        value: 'Module____Control::::Component____LoopControl',
        options: [
          {
            id: 'Module____Control::::Component____LoopControl',
            name: 'LoopControl',
          },
          {
            id: 'Module____Control::::Component____StandardControl',
            name: 'StandardControl',
          },
        ],
      },
      {
        name: 'Element',
        value: undefined,
        options: [
          {
            id: 'Module____Control::::Component____LoopControl::::Element____stdDeviation',
            name: 'stdDeviation',
          },
          {
            id: 'Module____Control::::Component____LoopControl::::Element____mean',
            name: 'mean',
          },
        ],
      },
    ])
  })
})
