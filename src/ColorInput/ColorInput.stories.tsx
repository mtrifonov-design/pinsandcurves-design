import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StyleProvider from '../StyleProvider';
import ColorInput from './ColorInput';



function ColorInputStory({width, height}: {width: string, height: string}) {
  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <ColorInput
      colorMode='rgb'
      color={{ r: 255, g: 100, b: 0 }}
    />
    </StyleProvider>
    </div>
}

const meta = {
  title: 'StyleLibrary/ColorInput/ColorInput',
  component: ColorInputStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ColorInputStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

