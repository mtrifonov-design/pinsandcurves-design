import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SimpleCommittedTextInput from './NumberInput';
import StyleProvider from '../StyleProvider';



function SimpleCommittedTextInputStory({width, height}: {width: string, height: string}) {

  const [number, setNumber] = useState(0);

  const valid = (text: string) => text === "text" || text === "text2";
  const onCommit = (n: number) => setNumber(n);
  console.log('onCommit', number);
  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <SimpleCommittedTextInput initialValue={number}  onChange={(n) => {
      console.log('onChange');

    }}
    onCommit={onCommit}
    key={String(number)}
    max={360}
    min={0}
    step={1}
    
    />
  </StyleProvider>

    </div>
}

const meta = {
  title: 'StyleLibrary/NumberInput',
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

