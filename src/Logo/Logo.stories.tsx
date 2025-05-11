import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SimpleCommittedTextInput from './SimpleCommittedTextInput';
import StyleProvider from '../StyleProvider';
import Logo from '.';


function LogoStory({width, height}: {width: string, height: string}) {

  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <Logo
        style={{
            width: '100%',
            height: '100%',
        }}
        color="var(--gray3)"
    />
  </StyleProvider>

    </div>
}

const meta = {
  title: 'StyleLibrary/Logo',
  component: LogoStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LogoStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

