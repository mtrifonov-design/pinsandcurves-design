import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
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
    const [colorMenuOpen, setColorMenuOpen] = useState(false);
    const [pointerDown, setPointerDown] = useState(false);
    const [startXY, setXY] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let dragging = false;
        const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
            if (gradientContainerRef.current === null) return;
            if (colorMenuOpen) return;
            if (!dragging) {
                const xy = { x: e.clientX, y: e.clientY };
                const dx = xy.x - startXY.x;
                const dy = xy.y - startXY.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const threshold = 5;
                if (dist > threshold) {
                    dragging = true;
                    onSelect();
                }
            } else {
                const rect = gradientContainerRef.current.getBoundingClientRect();
                let position = (e.clientX - rect.left) / rect.width;
                position = clamp(position, 0, 0.99);
                onPositionChange(position, false);
            }

        };
        const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
            if (gradientContainerRef.current === null) return;
            if (dragging) {
                const rect = gradientContainerRef.current.getBoundingClientRect();
                let position = (e.clientX - rect.left) / rect.width;
                position = clamp(position, 0, 0.99);
                onPositionChange(position, true);
            } else if (!colorMenuOpen) {
                setColorMenuOpen(true);
                onSelect();
            }
            setXY({ x: 0, y: 0 });
            if (dragging) {
                dragging = false;
            }
            setPointerDown(false);
        };
        if (pointerDown) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            if (pointerDown) {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
            }
        }

    }, [pointerDown]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setXY({ x: e.clientX, y: e.clientY });
        setPointerDown(true);
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
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 1,
    }}
        onPointerDown={handlePointerDown}
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

        <div style={{
            pointerEvents: 'none',
        }}>
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


    </div>
}

function useHybridState(externalState: ColorStops) {
    const [internalState, setInternalState] = useState<ColorStops>(externalState);

    useLayoutEffect(() => {
        const neq = (a: ColorStops, b: ColorStops) => {
            if (a.length !== b.length) return true;
            for (let i = 0; i < a.length; i++) {
                if (a[i].id !== b[i].id || a[i].position !== b[i].position || a[i].color.r !== b[i].color.r || a[i].color.g !== b[i].color.g || a[i].color.b !== b[i].color.b) {
                    return true;
                }
            }
            return false;
        }
        if (neq(internalState, externalState)) {
            setInternalState(externalState);
        }
    }, [externalState]);

    const setValue = setInternalState;
    const value = internalState;

    return {
        setValue,
        value,
    }
}

function GradientPicker({ stops, onChange, onCommit, style }: GradientPickerProps) {
    const [selectedStop, setSelectedStop] = useState<string | null>(null);

    const {
        value: internalStops,
        setValue: setInternalStops,
    } = useHybridState(stops);


    const getOnColorStopColorChange = (id: string) => {
        return (color: { r: number; g: number; b: number }, commit: boolean) => {
            const newStops = [...stops];
            const index = newStops.findIndex(s => s.id === id);
            newStops[index] = { ...newStops[index], color };
            if (commit && onCommit) {
                onCommit(newStops);
            } else if (onChange) {
                onChange?.(newStops);
            } else {
                setInternalStops(newStops);
            }
        }
    }

    const getOnColorStopPositionChange = (id: string) => {
        return (position: number, commit: boolean) => {
            const newStops = [...stops];
            const index = newStops.findIndex(s => s.id === id);
            newStops[index] = { ...newStops[index], position };
            newStops.sort((a, b) => a.position - b.position);
            if (commit && onCommit) {
                onCommit(newStops);
            } else if (onChange) {
                onChange?.(newStops);
            } else {
                setInternalStops(newStops);
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
        } else if (onChange) {
            onChange?.(newStops);
        } else {
            setInternalStops(newStops);
        }
    }

    const addColorStop = (e: React.PointerEvent<HTMLDivElement>) => {
        if (gradientContainerRef.current === null) return;
        const rect = gradientContainerRef.current.getBoundingClientRect();
        let position = (e.clientX - rect.left) / rect.width;
        position = clamp(position, 0, 0.99);
        const newStop = {
            color: { r: 1, g: 1, b: 1 },
            position,
            id: crypto.randomUUID()
        };
        const newStops = [...stops, newStop];
        newStops.sort((a, b) => a.position - b.position);
        setSelectedStop(newStop.id);
        if (onCommit) {
            onCommit(newStops);
        } else if (onChange) {
            onChange?.(newStops);
        } else {
            setInternalStops(newStops);
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
            width: '100%',
        }}>
            <div style={{
                height: '50px',
                width: '100%',
                borderRadius: 'var(--borderRadiusSmall)',
                boxShadow: 'inset 0 0 0 2px var(--gray2)',
                border: '2px solid var(--gray5)',
                background: `linear-gradient(to right, ${orderedStops.map(stop => `rgb(${Math.round(stop.color.r * 255)}, ${Math.round(stop.color.g * 255)}, ${Math.round(stop.color.b * 255)}) ${stop.position * 100}%`).join(', ')},rgb(${Math.round(orderedStops[0].color.r * 255)}, ${Math.round(orderedStops[0].color.g * 255)}, ${Math.round(orderedStops[0].color.b * 255)}) 100%)`,
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
                {internalStops.map((stop, index) => (
                    <ColorStop
                        key={stop.id}
                        stop={stop}
                        onColorChange={getOnColorStopColorChange(stop.id)}
                        onPositionChange={getOnColorStopPositionChange(stop.id)}
                        gradientContainerRef={gradientContainerRef}
                        isSelected={selectedStop === stop.id}
                        onSelect={() => setSelectedStop(stop.id)}
                    />
                ))}
            </div>
            <div>
                <Icon iconName="delete"
                    color={selectedStop ? 'var(--gray8)' : 'var(--gray3)'}
                    bgColor={selectedStop ? 'var(--gray4)' : 'transparent'}
                    onClick={deleteSelectedStop}
                />
            </div>
        </div>
    );
}

export default GradientPicker;