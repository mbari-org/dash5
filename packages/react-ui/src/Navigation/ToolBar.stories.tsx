import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { BarDivider } from './BarDivider'
import { BarGroup } from './BarGroup'
import { BarItem } from './BarItem'
import { BarSpacer } from './BarSpacer'
import { ToolBar, ToolBarProps } from './ToolBar'
import {
  faCut,
  faCopy,
  faPaste,
  faPencil,
  faPlus,
  faTrash,
  faBackward,
  faForward,
} from '@fortawesome/pro-solid-svg-icons'
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/pro-regular-svg-icons'
import { DateTime } from 'luxon'

const options = [
  {
    name: 'Important Show',
    lastAccessed: DateTime.local().minus({ minutes: 4 }),
  },
  {
    name: 'Ready to Shoot',
    lastAccessed: DateTime.local().minus({ minutes: 64 }),
  },
  {
    name: 'Another Show',
    lastAccessed: DateTime.local().minus({ hours: 9 }),
  },
  {
    name: 'Viewed A While Ago',
    lastAccessed: DateTime.local().minus({ days: 4 }),
  },
]

const MD_VISIBLE = 'hidden md:flex'
const LG_VISIBLE = 'hidden lg:flex'

export default {
  title: 'Navigation/Tool Bar',
  component: ToolBar,
} as Meta

const ToolBarStory: Story<ToolBarProps> = (args) => {
  return (
    <div
      className="flex w-full flex-col border border-stone-200"
      style={{ height: '640px' }}
    >
      <ToolBar {...args}>
        <BarGroup className={MD_VISIBLE}>
          <BarItem
            icon={faChevronLeft}
            appearance="button"
            toolTip="Previous"
            onClick={action('previous')}
            shortCut="&larr;"
            mode="secondary"
          />
          <BarItem
            toolTip="Current"
            shortCut="space"
            label="Now"
            appearance="button"
          />
          <BarItem
            icon={faChevronRight}
            appearance="button"
            toolTip="Next"
            onClick={action('next')}
            shortCut="&rarr;"
            mode="secondary"
          />
        </BarGroup>
        <BarSpacer />
        <BarItem
          icon={faPencil}
          toolTip="Edit"
          onClick={action('edit')}
          shortCut="e"
          mode="secondary"
          className={MD_VISIBLE}
        />
        <BarDivider className={MD_VISIBLE} />
        <BarItem
          icon={faCut}
          toolTip="Cut"
          onClick={action('cut')}
          shortCut="ctrl-x"
          mode="secondary"
          className={MD_VISIBLE}
        />
        <BarItem
          icon={faCopy}
          toolTip="Copy"
          onClick={action('copy')}
          shortCut="ctrl-c"
          mode="secondary"
          className={MD_VISIBLE}
        />
        <BarItem
          icon={faPaste}
          toolTip="Paste"
          onClick={action('paste')}
          shortCut="ctrl-v"
          mode="secondary"
          className={MD_VISIBLE}
        />
        <BarDivider className={MD_VISIBLE} />
        <BarItem
          icon={faTrash}
          toolTip="Delete"
          onClick={action('delete')}
          shortCut="delete"
          mode="secondary"
          className={MD_VISIBLE}
        />
        <BarSpacer />
        <BarItem
          icon={faPlus}
          toolTip="New Item"
          onClick={action('new')}
          mode="negative"
          indicated
          indicatorMode="primary"
        />
      </ToolBar>
      <div className="flex flex-grow bg-white">
        <p className="my-auto mx-auto rounded bg-blue-100 p-20">Some Content</p>
      </div>
    </div>
  )
}

export const Compact = ToolBarStory.bind({})

export const Hidden: any = ToolBarStory.bind({})
Hidden.args = {
  mode: 'hidden',
}
