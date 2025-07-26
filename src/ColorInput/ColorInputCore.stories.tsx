import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ColorInputCore from './ColorInputCore';
import StyleProvider from '../StyleProvider';



function ColorInputCoreStory({width, height}: {width: string, height: string}) {
  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <ColorInputCore />
    </StyleProvider>
    </div>
}

const meta = {
  title: 'StyleLibrary/ColorInputCore',
  component: ColorInputCoreStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ColorInputCoreStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

