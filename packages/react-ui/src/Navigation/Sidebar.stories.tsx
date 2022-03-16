import React, { useState } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { action } from '@storybook/addon-actions'
import { SideBar, SideBarProps } from './SideBar'
import { TabGroup } from './TabGroup'
import { Tab } from './Tab'
import { BarItem } from './BarItem'
import { BarSpacer } from './BarSpacer'

import {
  faFolderTree,
  faUsers,
  faAnalytics,
  faCog,
} from '@fortawesome/pro-regular-svg-icons'
import {
  faCalendarAlt,
  faChevronRight,
  faEnvelope,
  faInbox,
  faSignOut,
} from '@fortawesome/pro-solid-svg-icons'

export default {
  title: 'Navigation/Side Bar',
  component: SideBar,
} as Meta

type ExampleOption = 'explorer' | 'analytics' | 'settings' | 'access'

const SidebarStory: Story<SideBarProps> = (args) => {
  const [selected, setSelected] = useState('explorer' as ExampleOption)
  const handleSelected = (option: ExampleOption) => () => setSelected(option)
  return (
    <div
      className="flex w-full border border-stone-200"
      style={{ height: '640px' }}
    >
      <div className="flex flex-grow bg-white">
        <p className="my-auto mx-auto rounded bg-blue-100 p-20">Some Content</p>
      </div>
      <SideBar {...args}>
        {args.mode === 'expanded' ? (
          <TabGroup>
            <Tab
              icon={faFolderTree}
              selected={selected === 'explorer'}
              onClick={handleSelected('explorer')}
              grow={true}
            />
            <Tab
              icon={faUsers}
              selected={selected === 'access'}
              onClick={handleSelected('access')}
              grow={true}
            />
            <Tab
              icon={faAnalytics}
              selected={selected === 'analytics'}
              onClick={handleSelected('analytics')}
              grow={true}
            />
            <Tab
              icon={faCog}
              selected={selected === 'settings'}
              onClick={handleSelected('settings')}
              grow={true}
            />
          </TabGroup>
        ) : (
          <>
            <BarItem
              icon={faFolderTree}
              onClick={handleSelected('explorer')}
              toolTip="Explorer"
              toolTipDirection="left"
              mode="secondary"
            />
            <BarItem
              icon={faAnalytics}
              onClick={handleSelected('analytics')}
              toolTip="Analytics"
              toolTipDirection="left"
              mode="secondary"
            />
            <BarItem
              icon={faUsers}
              onClick={handleSelected('access')}
              toolTip="Access"
              toolTipDirection="left"
              mode="secondary"
            />
            <BarItem
              icon={faCog}
              onClick={handleSelected('settings')}
              toolTip="Settings"
              toolTipDirection="left"
              mode="secondary"
            />
          </>
        )}
        {args.mode === 'expanded' ? (
          <>
            <BarSpacer />
            <BarItem
              icon={faChevronRight}
              onClick={action('Hide')}
              toolTip="Hide"
              toolTipDirection="left"
              mode="secondary"
              indicated={true}
            />
          </>
        ) : null}
      </SideBar>
    </div>
  )
}

export const Compact = SidebarStory.bind({})

export const Expanded = SidebarStory.bind({})
Expanded.args = {
  mode: 'expanded',
}

export const Hidden = SidebarStory.bind({})
Hidden.args = {
  mode: 'hidden',
}

const NavigatorStory: Story<SideBarProps> = (args) => (
  <div
    className="flex w-full border border-stone-200"
    style={{ height: '640px' }}
  >
    <SideBar {...args}>
      <BarItem
        icon={faCalendarAlt}
        onClick={action('calendars')}
        toolTip="Calendars"
        toolTipDirection="right"
        mode="negative"
        indicated={true}
        indicatorMode="secondary"
      />
      <BarItem
        icon={faEnvelope}
        onClick={action('invitations')}
        toolTip="Invitations"
        toolTipDirection="right"
        mode="negative"
        indicated={true}
        indicatorMode="secondary"
      />
      <BarItem
        icon={faInbox}
        onClick={action('inbox')}
        toolTip="Inbox"
        toolTipDirection="right"
        mode="negative"
        indicated={true}
        indicatorMode="secondary"
      />
      <BarSpacer />
      <BarItem
        icon={faSignOut}
        onClick={action('logout')}
        toolTip="Logout"
        toolTipDirection="right"
        mode="negative"
        indicated={true}
        indicatorMode="secondary"
      />
    </SideBar>
    <div className="flex flex-grow bg-white">
      <p className="my-auto mx-auto rounded bg-blue-100 p-20">Some Content</p>
    </div>
  </div>
)

export const Navigator = NavigatorStory.bind({})
Navigator.args = {
  mode: 'compact',
  appearance: 'navigator',
  alignment: 'left',
}
