import React, { useLayoutEffect, useState } from "react";
import SimpleCommittedTextInput from "../SimpleCommittedTextInput/SimpleCommittedTextInput";
import { hsvToRgb, rgbToHsv, rgbToHex, hexToRgb, HSVColor, RGBColor } from "./helpers";

function ColorCircle(p: { color: string, radius?: number }) {
    return (
        <div
            style={{
                width: p.radius ? `${p.radius}px` : '20px',
                height: p.radius ? `${p.radius}px` : '20px',
                borderRadius: '50%',
                backgroundColor: p.color,
                border: '2px solid var(--gray7)',
                boxShadow: '0 0 2px 2px rgba(0, 0, 0, 0.2)',
            }}
        ></div>
    );
}



const computeSVMatrix = (hue: number, width: number, height: number) => {
    const svMatrix = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const s = x / width;
            const v = 1 - y / height;
            const rgb = hsvToRgb(hue, s, v);
            row.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        svMatrix.push(row);
    }
    return svMatrix;
}

function useHybridState(externalState: {h: number, s: number, v: number}) {
  const [internalState, setInternalState] = useState<{h: number, s: number, v: number}>(externalState);
  const [active, setActive] = useState(false);

  useLayoutEffect(() => {
    if (!active) {
      if (externalState !== internalState) {
        setInternalState(externalState);
      }
    }
  }, [externalState, active, internalState]);

  const setValue = setInternalState;
  const value = internalState;

  return {
    setValue,
    value,
    setActive,
    active,
  }
}

function ColorInputWrapper(p: {
    colorMode: 'rgb' | 'hsv' | 'hex',
    color: string | RGBColor | HSVColor,
    onChange?: (color: string | RGBColor | HSVColor) => void,
    onCommit?: (color: string | RGBColor | HSVColor) => void,
}) {

    const { colorMode, color, onChange, onCommit } = p;
    let hsv;
    if (colorMode === 'hex') {
        const rgb = hexToRgb(color as string);
        hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    } else if (colorMode === 'rgb') {
        hsv = rgbToHsv((color as RGBColor).r, (color as RGBColor).g, (color as RGBColor).b);
    } else {
        hsv = color as HSVColor;
    }

    const {
        setValue: setInternalColor,
        value: currentColor,
        active,
        setActive
    } = useHybridState(hsv);

    const setHsvChange = (newHsv: HSVColor) => {
        setInternalColor(newHsv);
        if (!onChange) return;
        if (colorMode === 'hsv') {
            onChange(newHsv);
        } else if (colorMode === 'rgb') {
            const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
            onChange({ r: rgb.r, g: rgb.g, b: rgb.b });
        } else if (colorMode === 'hex') {
            const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
            onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
    }

    const setHsvCommit = (newHsv: HSVColor) => {
        if (!onCommit) return;
        if (colorMode === 'hsv') {
            onCommit(newHsv);
        } else if (colorMode === 'rgb') {
            const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
            onCommit({ r: rgb.r, g: rgb.g, b: rgb.b });
        } else if (colorMode === 'hex') {
            const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
            onCommit(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
    }

    return <ColorInputFunctionality hsv={hsv} 
    setHsvChange={setHsvChange} 
    setDragging={setActive}
    setHsvCommit={onCommit ? setHsvCommit : undefined}
    />;

};

function ColorInputFunctionality(p: {
    hsv: HSVColor,
    setHsvChange: (hsv: HSVColor) => void,
    setHsvCommit?: (hsv: HSVColor) => void,
    setDragging: (dragging: boolean) => void,
}) {
    const { hsv, setHsvChange, setHsvCommit, setDragging } = p;
    const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hrgb = hsvToRgb(hsv.h, 1, 1);
    const hhex = rgbToHex(hrgb.r, hrgb.g, hrgb.b);
    const svMatrix = computeSVMatrix(hsv.h, 250, 250);
    const handleHueChange = (newHue: number, commit?: boolean) => {
        if (commit && setHsvCommit) {
            setHsvCommit({ ...hsv, h: newHue });
        } else {
            setHsvChange({ ...hsv, h: newHue });
        }
    }
    const handleSVChange = (newS: number, newV: number, commit?: boolean) => {
        const newHsv = { ...hsv, s: newS, v: newV };
        if (commit && setHsvCommit) {
            setHsvCommit(newHsv);
        } else {
            setHsvChange(newHsv);
        }
    }
    const handleHSVChange = (newHsv: HSVColor, commit?: boolean) => {
        if (commit && setHsvCommit) {
            setHsvCommit(newHsv);
        } else {
            setHsvChange(newHsv);
        }
    }

    return (
        <ColorInputCore
            hsv={hsv}
            hex={hex}
            hhex={hhex}
            rgb={rgb}
            onHueChange={handleHueChange}
            onSVChange={handleSVChange}
            onHSVChange={handleHSVChange}
            setDragging={setDragging}
        />
    );

}

function ColorInputCore(p: {
    hsv: { h: number, s: number, v: number },
    hex: string,
    hhex: string,
    rgb: { r: number, g: number, b: number },
    onHueChange: (newHue: number, commit?: boolean) => void,
    onSVChange: (newS: number, newV: number, commit?: boolean) => void,
    onHSVChange: (newHsv: { h: number, s: number, v: number }, commit?: boolean) => void,
    setDragging: (dragging: boolean) => void,
}) {

    const { hsv, hex, hhex, rgb, onHueChange, onSVChange, onHSVChange, setDragging } = p;
    const [selectorMoving, setSelectorMoving] = useState(false);

    const [svActive, setSvActive] = useState(false);

    const clamp = (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, value));
    }

    const sv_handleMouseDown = (e: React.MouseEvent) => {
        setSvActive(true);
        setDragging(true);
        // pointer capture
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.cursor = 'move';

    }
    const sv_handleMouseUp = (e: React.MouseEvent) => {
        setDragging(false);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const s = clamp(x / rect.width, 0, 1);
        const v = clamp(1 - y / rect.height, 0, 1);
        onSVChange(s, v, true);

        e.currentTarget.releasePointerCapture(e.pointerId);
        // reset cursor
        // @ts-ignore
        e.currentTarget.style.cursor = 'move';
        document.body.style.cursor = 'default';
        setSvActive(false);
        setSelectorMoving(false);
    }
    const sv_handleMouseMove = (e: React.MouseEvent) => {
        if (!svActive) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const s = clamp(x / rect.width, 0.01, 1);
        const v = clamp(1 - y / rect.height, 0.01, 1);
        e.currentTarget.style.cursor= 'none';
        setSelectorMoving(true);
        onSVChange(s, v);
    }

    const [hueActive, setHueActive] = useState(false);
    const hue_handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setHueActive(true);
        // pointer capture
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.cursor = 'ew-resize';

    }
    const hue_handleMouseUp = (e: React.MouseEvent) => {
        setDragging(false);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const hue = clamp(x / rect.width, 0, 0.99);
        onHueChange(hue, true);

        setHueActive(false);
        // release pointer capture
        e.currentTarget.releasePointerCapture(e.pointerId);
        // reset cursor
        // @ts-ignore
        document.body.style.cursor = 'default';
    }
    const hue_handleMouseMove = (e: React.MouseEvent) => {
        if (!hueActive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const hue = clamp(x / rect.width, 0, 0.99);
        onHueChange(hue);
    }

    const canvasRefSV = React.useRef<HTMLCanvasElement>(null);
    const canvasRefHue = React.useRef<HTMLCanvasElement>(null);

    useLayoutEffect(() => {
        const canvas = canvasRefSV.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const svMatrix = computeSVMatrix(hsv.h, width, height);
        // put image data into the canvas
        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const hex = svMatrix[y][x];
                const { r, g, b } = hexToRgb(hex);
                const index = (y * width + x) * 4;
                imageData.data[index] = r;
                imageData.data[index + 1] = g;
                imageData.data[index + 2] = b;
                imageData.data[index + 3] = 255; // Alpha channel
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }, [hsv.h]);
    useLayoutEffect(() => {
        const canvas = canvasRefHue.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // put the image data 
        const imageData = ctx.createImageData(width, height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const hue = x / width;
                const rgb = hsvToRgb(hue, 1, 1);
                const index = (y * width + x) * 4;
                imageData.data[index] = rgb.r;
                imageData.data[index + 1] = rgb.g;
                imageData.data[index + 2] = rgb.b;
                imageData.data[index + 3] = 255; // Alpha channel
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }, [hsv.s, hsv.v]);


    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: 'var(--gray2)',
        width: '250px',
    }}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
        }}>
            <div style={{
                height: '250px',
                backgroundColor: 'var(--gray3)',
                borderRadius: 'var(--borderRadiusSmall)',
                position: 'relative',
                border: '2px solid var(--gray5)',
                cursor: 'move',
            }}
                onPointerDown={sv_handleMouseDown}
                onPointerMove={sv_handleMouseMove}
                onPointerUp={sv_handleMouseUp}
            >
                <div
                    style={{
                        left: `${hsv.s * 100}%`,
                        top: `${(1 - hsv.v) * 100}%`,
                        position: 'absolute',
                        transform:'translate(-50%, -50%)',

                    }}
                >
                    <ColorCircle color={hex} 
                        radius={selectorMoving ? 30 : 20}
                    />
                </div>
                <canvas

                    ref={canvasRefSV}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    width={250}
                    height={250}
                />
            </div>
            <div style={{
                width: '100%',
                height: '15px',
                backgroundColor: 'var(--gray4)',
                borderRadius: 'var(--borderRadiusSmall)',
                position: 'relative',
                cursor: 'move',
            }}
                onPointerDown={hue_handleMouseDown}
                onPointerMove={hue_handleMouseMove}
                onPointerUp={hue_handleMouseUp}
            >
                <canvas
                    ref={canvasRefHue}
                    width={250}
                    height={15}
                    style={{
                        width: '100%',
                        height: '100%',
                        top: '0',
                        left: '0',
                        position: 'absolute',
                        border: '2px solid var(--gray5)',
                        borderRadius: 'var(--borderRadiusSmall)',
                    }}
                />
                <div
                    style={{
                        left: `${hsv.h * 100}%`,
                        top: '50%',
                        position: 'absolute',
                        transform:'translate(-50%, -50%)',
                    }}
                >
                    <ColorCircle color={hhex} />
                </div>

            </div>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
        }}>
            <SimpleCommittedTextInput 
                key={`${rgb.r}, ${rgb.g}, ${rgb.b}`}
                initialValue={`${rgb.r}, ${rgb.g}, ${rgb.b}`}
                onCommit={(value) => {
                    const match = value.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
                    if (!match) return;
                    const [_, r, g, b] = match.map(Number);
                    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return;
                    const { h, s, v } = rgbToHsv(r, g, b);
                    onHSVChange({ h, s, v }, true);
                }}
                isValid={(value) => {
                    const match = value.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
                    if (!match) return false;
                    const [_, r, g, b] = match.map(Number);
                    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
                }}
            />
            <SimpleCommittedTextInput
                key={hex}
                initialValue={hex}
                onCommit={(value) => {
                    const { r, g, b } = hexToRgb(value);
                    const { h, s, v } = rgbToHsv(r, g, b);
                    onHSVChange({ h, s, v }, true);
                }}
                isValid={(value) => {
                    const { r, g, b } = hexToRgb(value);
                    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
                }}
            />
        </div>
    </div>
}

export default ColorInputWrapper;