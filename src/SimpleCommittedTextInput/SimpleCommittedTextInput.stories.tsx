import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SimpleCommittedTextInput from './SimpleCommittedTextInput';
import StyleProvider from '../StyleProvider';


function SimpleCommittedTextInputStory({width, height}: {width: string, height: string}) {

  const [text, setText] = useState('text');

  const valid = (text: string) => text === "text" || text === "text2";
  const onCommit = (text: string) => setText(text);

  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <SimpleCommittedTextInput initialValue={text} isValid={valid} onCommit={onCommit}/>
  </StyleProvider>

    </div>
}

const meta = {
  title: 'StyleLibrary/SimpleCommittedTextInput',
  component: SimpleCommittedTextInputStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SimpleCommittedTextInputStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

