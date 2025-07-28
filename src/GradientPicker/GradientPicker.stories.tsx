import React, { useState, useRef, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StyleProvider from '../StyleProvider';
import ColorInput from './ColorInput';
import GradientPicker from './GradientPicker';


function GradientPickerStory({width, height}: {width: string, height: string}) {
    const [stops, setStops] = useState([
        { color: { r: 255, g: 0, b: 0 }, position: 0, id: 'stop1' },
        { color: { r: 0, g: 255, b: 0 }, position: 0.5, id: 'stop2' },
        { color: { r: 0, g: 0, b: 255 }, position: 0.9, id: 'stop3' }
    ]);

  return <div style={{
    width,
    height,
    backgroundColor: 'var(--gray2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}> 
  <StyleProvider>
    <GradientPicker 
        stops={stops}
        onChange={(stops) => {setStops(stops);}}
        onCommit={(stops) => setStops(stops)}
    />
  </StyleProvider>
  </div>
}

const meta = {
  title: 'StyleLibrary/ColorInput/GradientPicker',
  component: GradientPickerStory,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof GradientPickerStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    width: '500px',
    height: '500px',
  },
};

