import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Icon from './Icon';
import StyleProvider from '../StyleProvider';



function IconStory({width, height}: {width: string, height: string}) {
  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <Icon iconName="home" />
    </StyleProvider>
    </div>
}

const meta = {
  title: 'StyleLibrary/Icon',
  component: IconStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof IconStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

