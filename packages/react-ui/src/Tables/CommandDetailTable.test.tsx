import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  CommandDetailTable,
  CommandDetailProps,
  getValues,
  mapValues,
  scopedValues,
  OptionSet,
  scopedSelectOptions,
} from './CommandDetailTable'

const props: CommandDetailProps = {
  parameters: [
    {
      name: 'Module',
      description: 'Description of a module',
      value: 'Module____Science',
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
  // See supplied parameter values in props above as Module____Science.
  expect(screen.getByText('Science')).toBeInTheDocument()
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

  test('should not include groupedOptions or pinnedNames keys when not provided', () => {
    const values = scopedSelectOptions('', optionSets)
    expect(Object.keys(values[0])).not.toContain('groupedOptions')
    expect(Object.keys(values[0])).not.toContain('pinnedNames')
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

describe('scopedSelectOptions with groupBy', () => {
  const missionGroupBy = (path: string) => {
    const slash = path.lastIndexOf('/')
    return slash >= 0 ? path.slice(0, slash) : 'Standard Ops'
  }

  const missionOptionSets: OptionSet[] = [
    {
      name: 'Mission',
      options: ['Science/sci2_circle.tl', 'Science/profile.xml', 'quick.tl'],
      groupBy: missionGroupBy,
    },
  ]

  test('should produce groupedOptions when groupBy is provided', () => {
    const [tier] = scopedSelectOptions('', missionOptionSets)
    expect(tier.groupedOptions).toBeDefined()
    const labels = tier.groupedOptions?.map((g) => g.label)
    expect(labels).toContain('Science')
    expect(labels).toContain('Standard Ops')
  })

  test('should strip file extensions from grouped option display names', () => {
    const [tier] = scopedSelectOptions('', missionOptionSets)
    const scienceGroup = tier.groupedOptions?.find((g) => g.label === 'Science')
    expect(scienceGroup?.options.map((o) => o.name)).toEqual([
      'sci2_circle',
      'profile',
    ])
  })

  test('should strip file extensions from flat option display names', () => {
    const [tier] = scopedSelectOptions('', missionOptionSets)
    const rootGroup = tier.groupedOptions?.find(
      (g) => g.label === 'Standard Ops'
    )
    expect(rootGroup?.options.map((o) => o.name)).toEqual(['quick'])
  })

  test('should not include groupedOptions key when groupBy is not provided', () => {
    const flatSets: OptionSet[] = [{ name: 'Module', options: ['A', 'B'] }]
    const [tier] = scopedSelectOptions('', flatSets)
    expect(Object.keys(tier)).not.toContain('groupedOptions')
  })
})

describe('scopedSelectOptions with pinnedNames', () => {
  test('should include pinnedNames key when provided', () => {
    const sets: OptionSet[] = [
      { name: 'Mission', options: ['Science/sci2.tl'], pinnedNames: ['sci2'] },
    ]
    const [tier] = scopedSelectOptions('', sets)
    expect(tier.pinnedNames).toEqual(['sci2'])
  })

  test('should not include pinnedNames key when not provided', () => {
    const sets: OptionSet[] = [
      { name: 'Mission', options: ['Science/sci2.tl'] },
    ]
    const [tier] = scopedSelectOptions('', sets)
    expect(Object.keys(tier)).not.toContain('pinnedNames')
  })
})

describe('scopedSelectOptions with optionLabels', () => {
  const unitOptionSet: OptionSet[] = [
    {
      name: 'Units',
      options: ['h', 'min', 's'],
      optionLabels: { h: 'hour', min: 'minute', s: 'second' },
    },
  ]

  test('should use optionLabels as display name while preserving the raw value in the id', () => {
    const [tier] = scopedSelectOptions('', unitOptionSet)
    expect(tier.options).toEqual([
      { id: 'Units____h', name: 'hour' },
      { id: 'Units____min', name: 'minute' },
      { id: 'Units____s', name: 'second' },
    ])
  })

  test('should fall back to the raw option value when no label is provided for that key', () => {
    const sets: OptionSet[] = [
      {
        name: 'Units',
        options: ['h', 'kg'],
        optionLabels: { h: 'hour' },
      },
    ]
    const [tier] = scopedSelectOptions('', sets)
    expect(tier.options.find((o) => o.id === 'Units____kg')?.name).toBe('kg')
  })

  test('should apply optionLabels inside groupedOptions when groupBy is also provided', () => {
    const sets: OptionSet[] = [
      {
        name: 'Mission',
        options: ['Science/sci2.tl'],
        groupBy: (p) => p.split('/')[0] ?? 'Other',
        optionLabels: { 'Science/sci2.tl': 'Sci2 — standard science' },
      },
    ]
    const [tier] = scopedSelectOptions('', sets)
    const sciGroup = tier.groupedOptions?.find((g) => g.label === 'Science')
    expect(sciGroup?.options[0].name).toBe('Sci2 — standard science')
  })
})

describe('mapValues', () => {
  test('should return an empty object for an empty string', () => {
    expect(mapValues('')).toEqual({})
  })

  test('should return the correct key-value map for a single tier', () => {
    expect(mapValues('Module____Science')).toEqual({ Module: 'Science' })
  })

  test('should return the correct key-value map for multiple tiers', () => {
    expect(mapValues('Module____Control::::Component____LoopControl')).toEqual({
      Module: 'Control',
      Component: 'LoopControl',
    })
  })
})
