import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import StyleProvider from '../StyleProvider';

function ButtonStory({width, height}: {width: string, height: string}) {
  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
    <StyleProvider>    
      <Button  text="hello" />
    </StyleProvider>

    </div>
}

const meta = {
  title: 'StyleLibrary/Button',
  component: ButtonStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ButtonStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

