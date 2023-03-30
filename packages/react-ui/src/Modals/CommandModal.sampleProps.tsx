import { CommandModalProps } from './CommandModal'

export const syntaxVariations: CommandModalProps['syntaxVariations'] = [
  { argList: [], help: 'List all failed components' },
  {
    argList: [
      { argType: 'ARG_KEYWORD', keyword: 'show', required: 'REQUIRED' },
      { argType: 'ARG_COMPONENT', required: 'REQUIRED' },
    ],
    help: 'Show failure state of one component',
  },
  {
    argList: [
      { argType: 'ARG_KEYWORD', keyword: 'none', required: 'REQUIRED' },
      { argType: 'ARG_COMPONENT', required: 'REQUIRED' },
    ],
    help: 'Clear failure state of one component',
  },
  {
    argList: [
      { argType: 'ARG_KEYWORD', keyword: 'hardware', required: 'REQUIRED' },
      { argType: 'ARG_COMPONENT', required: 'REQUIRED' },
    ],
    help: "Set failure state of one component to 'Hardware Failure'",
  },
  {
    argList: [
      { argType: 'ARG_KEYWORD', keyword: 'software', required: 'REQUIRED' },
      { argType: 'ARG_COMPONENT', required: 'REQUIRED' },
    ],
    help: "Set failure state of one component to 'Software Failure'",
  },
  {
    argList: [
      { argType: 'ARG_KEYWORD', keyword: 'segfault', required: 'REQUIRED' },
      { argType: 'ARG_COMPONENT', required: 'REQUIRED' },
    ],
    help: 'Create component software failure via an actual segfault',
  },
]

export const commands: CommandModalProps['commands'] = [
  { id: '?', name: '?', description: 'Show help' },
  {
    id: '!',
    name: '!',
    description:
      'Bash command with no stdin, stdout routed to syslog IMPORTANT',
  },
  {
    id: 'burn',
    name: 'burn',
    description: 'Burn (or stop burning) the burnwire',
  },
  {
    id: 'strobe',
    name: 'strobe',
    description: 'Enable (or disable) the strobe',
  },
  {
    id: 'configSet',
    name: 'configSet',
    description: 'Set configuration variable value',
  },
  {
    id: 'conversation',
    name: 'conversation',
    description: 'Show, start and stop satellite conversations',
  },
  {
    id: 'DDM',
    name: 'DDM',
    description: 'Set the docking module state to standby, arm, or detach',
  },
  {
    id: 'DockingServo',
    name: 'DockingServo',
    description: 'Set the docking servo state to standby, arm, or detach',
  },
  {
    id: 'failComponent',
    name: 'failComponent',
    description: 'Show, set, or clear failed state of components',
  },
  {
    id: 'failVariable',
    name: 'failVariable',
    description: 'Show, set, or clear failed state of values',
  },
  {
    id: 'fileExec',
    name: 'fileExec',
    description:
      'Execute contents of file that follows (.sbd or plain text) as if it were sent remotely',
  },
  { id: 'get', name: 'get', description: 'Get variable value' },
  {
    id: 'gfscan',
    name: 'gfscan',
    description: 'Allow CBIT to scan for ground faults',
  },
  {
    id: 'help',
    name: 'help',
    description: 'Show help, optionally for a specific command',
  },
  { id: 'ibit', name: 'ibit', description: 'Run Initiated Built In Test' },
  { id: 'load', name: 'load', description: 'Load, but do not run mission' },
  { id: 'maintain', name: 'maintain', description: 'Maintain variable value' },
  {
    id: 'quick',
    name: 'quick',
    description: 'Toggle state of quicker than realtime execution',
  },
  {
    id: 'quit',
    name: 'quit',
    description: 'Stop any running mission and exit LRAUV program',
  },
  { id: 'report', name: 'report', description: 'Report variable value' },
  {
    id: 'restart',
    name: 'restart',
    description: 'Restart, from least impact (logs) to most impact (system)',
  },
  { id: 'resume', name: 'resume', description: 'Resume loaded mission' },
  { id: 'retransmit', name: 'retransmit', description: 'Retransmit data' },
  { id: 'run', name: 'run', description: 'Run mission' },
  {
    id: 'schedule',
    name: 'schedule',
    description: 'Schedule commands for later execution',
  },
  { id: 'send', name: 'send', description: 'Send variable value or command' },
  { id: 'set', name: 'set', description: 'Set variable value' },
  { id: 'show', name: 'show', description: 'Show information' },
  { id: 'stop', name: 'stop', description: 'Stop currently running mission' },
  { id: 'ubat', name: 'ubat', description: 'Enable (or disable) the UBAT' },
]
