import React from "react";
import { Popover } from 'radix-ui';
import ColorInputCore from "./ColorInputCore";
import styles from './styles.modules.css';
import { hexToRgb, hsvToRgb } from "./helpers";
import type { RGBColor, HSVColor } from "./helpers";

type ColorInputProps = {
    color: string | RGBColor | HSVColor;
    colorMode?: 'rgb' | 'hsl' | 'hex';
    onChange?: (color: string | RGBColor | HSVColor) => void;
    onCommit?: (color: string | RGBColor | HSVColor) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}


function ColorInput(props: ColorInputProps) {

    const { color, colorMode = 'hex', onChange, onCommit, styleTrigger=null } = props;

    const rgb : RGBColor = colorMode === 'hex' ? hexToRgb(color as string) :
        colorMode === 'rgb' ? color as RGBColor :
        hsvToRgb((color as HSVColor).h, (color as HSVColor).s, (color as HSVColor).v);
    

    return (
        <Popover.Root
            open={props.open}
            onOpenChange={props.onOpenChange}
        >
            <Popover.Trigger asChild>
                <div style={{
                    backgroundColor: `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`,
                    width: '35px',
                    height: '35px',
                    cursor: 'pointer',
                    border: '2px solid var(--gray6)',
                    boxShadow: 'inset 0 0 0 2px var(--gray1)',
                    borderRadius: 'var(--borderRadiusSmall)',
                    ...styleTrigger
                }}></div>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content 
                sideOffset={5}
                className={styles.Content}>
                    <div style={{
                    }}>
                        <ColorInputCore 
                            colorMode='rgb'
                            color={rgb}
                            onChange={onChange}
                            onCommit={onCommit}
                        />
                    </div>
                    <Popover.Arrow className={styles.Arrow} />
                </Popover.Content>
                
            </Popover.Portal>
        </Popover.Root>
    );
}

export default ColorInput;