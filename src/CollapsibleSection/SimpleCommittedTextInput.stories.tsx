import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SimpleCommittedTextInput from './SimpleCommittedTextInput';
import StyleProvider from '../StyleProvider';
import CollapsibleSection from './CollapsibleSection';


function CollapsibleSectionStory({width, height}: {width: string, height: string}) {

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
    <CollapsibleSection
      title="Collapsible Section"
    >
      Test Content
      </CollapsibleSection>

  </StyleProvider>

    </div>
}

const meta = {
  title: 'StyleLibrary/CollapsibleSection',
  component: CollapsibleSectionStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CollapsibleSectionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

