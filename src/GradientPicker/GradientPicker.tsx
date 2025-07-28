import React, { useRef, useState } from "react";
import ColorInput from "../ColorInput/ColorInput";
import Icon from "../Icon/Icon";

type ColorStops = {
    color: { r: number; g: number; b: number };
    position: number; // Position in the gradient, from 0 to 1
    id: string;
}[];

type GradientPickerProps = {
    stops: ColorStops;
    onChange?: (stops: ColorStops) => void;
    onCommit?: (stops: ColorStops) => void;
    style?: React.CSSProperties;
};

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
}

function ColorStop(p: {
    stop: ColorStops[number];
    onColorChange: (color: { r: number; g: number; b: number }, commit: boolean) => void;
    onPositionChange: (position: number, commit: boolean) => void;
    gradientContainerRef: React.RefObject<HTMLDivElement>,
    isSelected: boolean;
    onSelect: () => void;

}) {
    const colorStopRef = useRef<HTMLDivElement>(null);
    const { stop, onColorChange, onPositionChange, gradientContainerRef, isSelected, onSelect } = p;
    const [dragging, setDragging] = useState(false);
    const [colorMenuOpen, setColorMenuOpenRaw] = useState(false);
    const setColorMenuOpen = (open: boolean) => {
        console.log('setColorMenuOpen', open);
        setColorMenuOpenRaw(open);
    };
    const [pointerDown, setPointerDown] = useState(false);
    const [startXY, setXY] = useState({ x: 0, y: 0 });
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (colorMenuOpen) return;
        setXY({ x: e.clientX, y: e.clientY });
        setPointerDown(true);
        // set pointer capture
        if (colorStopRef.current === null) return;
        colorStopRef.current.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (gradientContainerRef.current === null) return;
        if (!dragging && pointerDown) {
            const xy = { x: e.clientX, y: e.clientY };
            const dx = xy.x - startXY.x;
            const dy = xy.y - startXY.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const threshold = 5;
            if (dist > threshold) {
                setDragging(true);
                onSelect();
            }
        } else if (dragging) {
            const rect = gradientContainerRef.current.getBoundingClientRect();
            let position = (e.clientX - rect.left) / rect.width;
            position = clamp(position, 0, 0.99);
            onPositionChange(position, false);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (colorMenuOpen) return;
        if (dragging) {
            setDragging(false);
            onPositionChange(stop.position, true);
        }
        setXY({ x: 0, y: 0 });
        setPointerDown(false);
        if (colorStopRef.current === null) return;
        colorStopRef.current.releasePointerCapture(e.pointerId);
        if (!dragging) {
            setColorMenuOpen(!colorMenuOpen);
            onSelect();
        }
    };

    return <div style={{
        position: 'absolute',
        left: `${stop.position * 100}%`,
        transform: 'translateX(-50%) translateY(50%)',
        bottom: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={colorStopRef}
    >
        <div style={{
            position: 'relative',
            width: '10px',
            height: '8px',
        }}
        >
            <div style={{
                position: 'absolute',
                width: "10px",
                height: "8px",
                backgroundColor: 'var(--gray6)',
                clipPath: 'polygon(50% 0,100% 100%,0 100%)',
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '0px',
                left: '1px',
                width: "8px",
                height: "6px",
                backgroundColor: 'var(--gray1)',
                clipPath: 'polygon(50% 0,100% 100%,0 100%)',
            }}></div>
        </div>

        <ColorInput
            color={{ r: stop.color.r, g: stop.color.g, b: stop.color.b }}
            colorMode='rgb'
            onChange={(color) => {
                onColorChange(color as { r: number; g: number; b: number }, false);
            }}
            onCommit={(color) => {
                onColorChange(color as { r: number; g: number; b: number }, true);
            }}
            open={colorMenuOpen}
            onOpenChange={setColorMenuOpen}
            styleTrigger={{
                border: isSelected ? '2px solid var(--gray8)' : '2px solid var(--gray6)',
            }}
        />

    </div>
}

function GradientPicker({ stops, onChange, onCommit, style }: GradientPickerProps) {
    //console.log(`linear-gradient(to right, ${stops.map(stop => `rgb(${stop.color.r}, ${stop.color.g}, ${stop.color.b}) ${stop.position * 100}%`).join(', ')},rgb(${stops[0].color.r}, ${stops[0].color.g}, ${stops[0].color.b}) 100%,)`)

    const [selectedStop, setSelectedStop] = useState<string | null>(null);

    const getOnColorStopColorChange = (id: string) => {
        return (color: { r: number; g: number; b: number }, commit: boolean) => {
            const newStops = [...stops];
            const index = newStops.findIndex(s => s.id === id);
            newStops[index] = { ...newStops[index], color };
            if (commit && onCommit) {
                onCommit(newStops);
            } else {
                onChange?.(newStops);
            }
        }
    }

    const getOnColorStopPositionChange = (id: string) => {
        return (position: number, commit: boolean) => {
            const newStops = [...stops];
            const index = newStops.findIndex(s => s.id === id);
            newStops[index] = { ...newStops[index], position };
            if (commit && onCommit) {
                onCommit(newStops);
            } else {
                onChange?.(newStops);
            }
        }
    }

    const deleteSelectedStop = () => {
        if (selectedStop === null) return;
        if (stops.length < 2) return;
        const newStops = stops.filter(s => s.id !== selectedStop);
        setSelectedStop(null);
        if (onCommit) {
            onCommit(newStops);
        } else {
            onChange?.(newStops);
        }
    }

    const addColorStop = (e: React.PointerEvent<HTMLDivElement>) => {
        if (gradientContainerRef.current === null) return;
        const rect = gradientContainerRef.current.getBoundingClientRect();
        let position = (e.clientX - rect.left) / rect.width;
        position = clamp(position, 0, 0.99);
        const newStop = {
            color: { r: 255, g: 255, b: 255 },
            position,
            id: crypto.randomUUID()
        };
        const newStops = [...stops, newStop];
        setSelectedStop(newStop.id);
        if (onCommit) {
            onCommit(newStops);
        } else {
            onChange?.(newStops);
        }
    }

    const gradientContainerRef = useRef<HTMLDivElement>(null);

    const orderedStops = [...stops].sort((a, b) => a.position - b.position);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
        }}>
            <div style={{
                width: '200px',
                height: '50px',
                borderRadius: 'var(--borderRadiusSmall)',
                boxShadow: 'inset 0 0 0 2px var(--gray2)',
                border: '2px solid var(--gray5)',
                background: `linear-gradient(to right, ${orderedStops.map(stop => `rgb(${stop.color.r}, ${stop.color.g}, ${stop.color.b}) ${stop.position * 100}%`).join(', ')},rgb(${orderedStops[0].color.r}, ${orderedStops[0].color.g}, ${orderedStops[0].color.b}) 100%)`,
                position: 'relative',
                cursor: 'crosshair'
            }}
                ref={gradientContainerRef}


            >
                <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair',
                }}
                    onClick={addColorStop}
                ></div>



                {/* Render color stops here */}
                {stops.map((stop, index) => (
                    <ColorStop
                        key={stop.id} stop={stop}
                        onColorChange={getOnColorStopColorChange(stop.id)}
                        onPositionChange={getOnColorStopPositionChange(stop.id)}
                        gradientContainerRef={gradientContainerRef}
                        isSelected={selectedStop === stop.id}
                        onSelect={() => setSelectedStop(stop.id)}
                    />
                ))}
            </div>
            <Icon iconName="delete" 
                color={selectedStop ? 'var(--gray6)' : 'var(--gray3)'}
                bgColor={selectedStop ? 'var(--gray3)' : 'transparent'}
                onClick={deleteSelectedStop}
            />
        </div>
    );
}

export default GradientPicker;