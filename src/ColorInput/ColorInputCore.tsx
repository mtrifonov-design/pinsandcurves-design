import React, { useLayoutEffect, useState, useRef } from "react";
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

function parseHSVColor(color: string | RGBColor | HSVColor, colorMode: 'hex' | 'rgb' | 'hsv'): HSVColor {
        let hsv = { h: 0, s: 0, v: 0 };
        if (colorMode === 'hex') {
            const rgb = hexToRgb(color as string);
            hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        } else if (colorMode === 'rgb') {
            hsv = rgbToHsv((color as RGBColor).r, (color as RGBColor).g, (color as RGBColor).b);
        } else {
            hsv = color as HSVColor;
        }
        return hsv;
}

function useHybridState(externalState: RGBColor | HSVColor | 'string', colorMode: 'rgb' | 'hsv' | 'hex') {
    const externalHSV = parseHSVColor(externalState, colorMode)
    const extState = {
        h: externalHSV.h === undefined ? 0 : externalHSV.h,
        s: externalHSV.s,
        v: externalHSV.v
    } as { h: number, s: number, v: number };
    const [internalState, setInternalState] = useState<{ h: number, s: number, v: number }>(extState);

    useLayoutEffect(() => {
        const externalHSV = parseHSVColor(externalState, colorMode);
        const neq = (a: { h: number | undefined, s: number, v: number }, b: { h: number | undefined, s: number, v: number }) => {
            return a.h !== b.h || a.s !== b.s || a.v !== b.v;
        }
        if (neq(internalState, externalHSV)) {
            const extState = {
                h: externalHSV.h !== undefined ? externalHSV.h : internalState.h,
                s: externalHSV.s,
                v: externalHSV.v
            }
            setInternalState(extState);
        }
    }, [externalState]);

    const setValue = setInternalState;
    const value = internalState;

    return {
        setValue,
        value,
    }
}

function ColorInputWrapper(p: {
    colorMode: 'rgb' | 'hsv' | 'hex',
    color: string | RGBColor | HSVColor,
    onChange?: (color: string | RGBColor | HSVColor) => void,
    onCommit?: (color: string | RGBColor | HSVColor) => void,
}) {

    const { colorMode, color, onChange, onCommit } = p;

    const parseHSVColor = (color: string | RGBColor | HSVColor, colorMode: 'hex' | 'rgb' | 'hsv') => {
        if (colorMode === 'hex') {
            return rgbToHsv(hexToRgb(color as string));
        } else if (colorMode === 'rgb') {
            return rgbToHsv(color as RGBColor);
        } else if (colorMode === 'hsv') {
            return color as HSVColor;
        }
        throw new Error(`Unsupported color mode: ${colorMode}`);
    }
    const memoryColor = useRef({ h: 0, s: 0, v: 0 });
    const hsv = parseHSVColor(color, colorMode);
    if (hsv.h === undefined) hsv.h = memoryColor.current.h;
    if (hsv.s === undefined) hsv.s = memoryColor.current.s;
    if (hsv.v === undefined) hsv.v = memoryColor.current.v;
    const produceOutColor = (hsv: { h: number, s: number, v: number }, colorMode: 'hex' | 'rgb' | 'hsv') => {
        if (colorMode === 'hex') {
            return rgbToHex(hsvToRgb(hsv));
        } else if (colorMode === 'rgb') {
            return hsvToRgb(hsv);
        } else if (colorMode === 'hsv') {
            return hsv;
        }
        throw new Error(`Unsupported color mode: ${colorMode}`);
    }
    const [changeId, setChangeId] = useState(0);
    const onHSVChange = (newHsv: { h: number, s: number, v: number }, commit?: boolean) => {
        memoryColor.current = newHsv;
        const outColor = produceOutColor(newHsv, colorMode);
        if (commit && onCommit) {
            onCommit(outColor);
        } else if (onChange) {
            onChange(outColor);
        } else {
            setChangeId(prev => prev + 1); 
        }
    }

    return <ColorInputCore
        hsv={hsv}
        onHSVChange={onHSVChange}
    />

};

function ColorInputCore(p: {
    hsv: { h: number, s: number, v: number },
    onHSVChange: (newHsv: { h: number, s: number, v: number }, commit?: boolean) => void,
}) {

    const { hsv, onHSVChange } = p;
    const [selectorMoving, setSelectorMoving] = useState(false);
    const [svActive, setSvActive] = useState(false);

    const clamp = (value: number, min: number, max: number) => {
        return Math.max(min, Math.min(max, value));
    }

    const sv_handleMouseDown = (e: React.MouseEvent) => {
        setSvActive(true);
        // pointer capture
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.cursor = 'move';

    }
    const sv_handleMouseUp = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const s = clamp(x / rect.width, 0.01, 1);
        const v = clamp(1 - y / rect.height, 0.01, 1);
        onHSVChange({ h: hsv.h, s, v }, true);

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
        e.currentTarget.style.cursor = 'none';
        setSelectorMoving(true);
        onHSVChange({ h: hsv.h, s, v });
    }

    const [hueActive, setHueActive] = useState(false);
    const hue_handleMouseDown = (e: React.MouseEvent) => {
        setHueActive(true);
        // pointer capture
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.cursor = 'ew-resize';

    }
    const hue_handleMouseUp = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const hue = clamp(x / rect.width, 0, 0.99);
        onHSVChange({ h: hue, s: hsv.s, v: hsv.v }, true);

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
        onHSVChange({ h: hue, s: hsv.s, v: hsv.v });
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

        // put image data into the canvas
        const imageData = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const { r, g, b } = hsvToRgb({h: hsv.h, s: x / width, v: 1 - y / height});
                const index = (y * width + x) * 4;
                imageData.data[index] = Math.round(r * 255);
                imageData.data[index + 1] = Math.round(g * 255);
                imageData.data[index + 2] = Math.round(b * 255);
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
                const rgb = hsvToRgb({h: hue, s: 1, v: 1});
                const index = (y * width + x) * 4;
                imageData.data[index] = Math.round(rgb.r * 255);
                imageData.data[index + 1] = Math.round(rgb.g * 255);
                imageData.data[index + 2] = Math.round(rgb.b * 255);
                imageData.data[index + 3] = 255; // Alpha channel
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }, [hsv.s, hsv.v]);
    const rgb = hsvToRgb(hsv);


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
                        transform: 'translate(-50%, -50%)',

                    }}
                >
                    <ColorCircle color={rgbToHex(hsvToRgb(hsv))}
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
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <ColorCircle color={rgbToHex(hsvToRgb({h: hsv.h, s: 1, v: 1}))} />
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
                key={`${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}`}
                initialValue={`${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}`}
                onCommit={(value) => {
                    const match = value.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
                    if (!match) return;
                    let [_, r, g, b] = match.map(Number);
                    r /= 255; g /= 255; b /= 255;
                    if (r < 0 || r > 1 || g < 0 || g > 1 || b < 0 || b > 1) return;
                    const { h, s, v } = rgbToHsv({ r, g, b });
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
                key={rgbToHex(hsvToRgb(hsv))}
                initialValue={rgbToHex(hsvToRgb(hsv))}
                onCommit={(value) => {
                    const { r, g, b } = hexToRgb(value);
                    const { h, s, v } = rgbToHsv({ r, g, b });
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