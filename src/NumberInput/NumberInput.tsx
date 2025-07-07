import React, { useEffect, useLayoutEffect, useState } from "react";
import {createPortal} from "react-dom";

const DEFAULT_PX_FOR_FULL_RANGE = 150;
const DEFAULT_HOVER_SCALE = 1.8;
const DEFAULT_HOVER_OFFSET_MAX = 8;
const DRAG_THRESHOLD = 3;
const EPS = 1e-9;

type NumInputProps = {
  onCommit?: (n: number) => void;
  onChange?: (n: number) => void;
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  dragPixelsForFullRange?: number;
  hoverScale?: number;
  hoverColor?: string;
  hoverShadow?: string;
  hoverOffsetMax?: number;
  color?: string;
  bgColor?: string;
  bgActive?: string;
  bgInvalidInput?: string;
  invalidInputColor?: string;
  charSize?: number;
  maxCharSize?: number;
};

function useHybridState(externalState: number) {
  const [internalState, setInternalState] = useState<number>(externalState);
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
function SimpleCommittedNumberInput(props: NumInputProps) {

  const {
    value,
    setValue,
    active,
    setActive
  } = useHybridState(props.initialValue ?? 0);

  const [state, setState] = useState<"inactive" | "editing" | "dragging">("inactive");
  const setDragging = () => {setState("dragging"); setActive(true);};
  const setEditing = () => {setState("editing"); setActive(true);};
  const setInactive = () => {setState("inactive"); setActive(false);};

  if (state === "inactive") {
    return <InactiveNumberInput
      value={value}
      setValue={setValue}
      setEditing={setEditing}
      setDragging={setDragging}
      {...props}
    />;
  }
  if (state === "editing") {
    return <EditingNumberInput
      value={value}
      setValue={setValue}
      setInactive={setInactive}
      {...props}
    />;
  }
  if (state === "dragging") {
    return <DraggingNumberInput
      value={value}
      setValue={setValue}
      setInactive={setInactive}
      {...props}
    />;
  }
  return null;
}

function InactiveNumberInput(props :NumInputProps & {
  value: number;
  setValue: (n: number) => void;
  setEditing: () => void;
  setDragging: () => void;
}) {
  const { value, setValue, setEditing, setDragging, ...rest } = props;

  const [startPosition, setStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggingThresholdMet, setDraggingThresholdMet] = useState(false);
  const down = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.button !== 0) return; // only left click
    setStartPosition({ x: e.clientX, y: e.clientY });
  }
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const DRAG_THRESHOLD = 3;
    if (!startPosition) return;
    const dx = e.clientX - startPosition.x;
    const dy = e.clientY - startPosition.y;
    if (!draggingThresholdMet && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      setDraggingThresholdMet(true);
      setDragging();
    }
  }
  const up = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!startPosition) return;
    if (!draggingThresholdMet) {
      setEditing();
    }
    setStartPosition(null);
    setDraggingThresholdMet(false);
  };

  return (
    <div
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "var(--borderRadiusSmall)",
        backgroundColor: rest.bgColor || "var(--gray3)",
        color: rest.color || "var(--gray7)",
        cursor: "ns-resize",
        width: "10ch",
        height: "2em",
        userSelect: "none",
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
    >
      {value}
    </div>
  );
}

function EditingNumberInput(props: NumInputProps & {
  value: number;
  setValue: (n: number) => void;
  setInactive: () => void;
}) {
  const { value, setValue, setInactive, ...rest } = props;
  const [validInput, setValidInput] = useState(true);
  const isValid = (n: number) => {
    return !Number.isNaN(n) && (rest.min == null || n >= rest.min) && (rest.max == null || n <= rest.max);
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value;
    const n = parseFloat(val);
    setValidInput(isValid(n));
  };

  const onInputCommit = () => {
    const val = inputRef.current?.value || "";
    const n = parseFloat(val);
    if (isValid(n)) {
      setValue(n);
    }
    if ((props.onCommit || props.onChange) && isValid(n)) {
      if (props.onCommit) {
        props.onCommit(n);
      } else {
        props.onChange?.(n);
      }
    }
    setInactive();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={String(value)}
      onChange={onInputChange}
      onBlur={onInputCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onInputCommit();
        } else if (e.key === "Escape") {
          setInactive();
        }
      }}
      style={{
        padding: "5px",
        borderRadius: "var(--borderRadiusSmall)",
        backgroundColor: rest.bgActive || "var(--gray4)",
        color: validInput ? (rest.color || "var(--gray7)") : (rest.invalidInputColor || "var(--danger)"),
        border: "1px solid",
        borderColor: validInput ? (rest.color || "var(--gray7)") : (rest.invalidInputColor || "var(--danger)"),
        width: "10ch",
        height: "2em",
      }}
    />
  );
}

function ProgressDisplayPortal(props: { top: number, left: number, value: number,
  setValue: (n: number) => void;
  setInactive: () => void; } & NumInputProps) {
  const { value, setValue, setInactive, ...rest } = props;

  const ref = React.useRef<HTMLDivElement>(null);
  const startPositionRef = React.useRef<null | {x: number,y:number}>(null);
  const startValue = React.useRef(value).current;

  const min = rest.min ?? 0;
  const max = rest.max ?? 100;
  const percent = (value - min) / (max - min);

  const step = rest.step ?? 0.01;
  const decimals = React.useMemo(() => {
    if (step == null) return 6;
    const s = step.toString();
    const idx = s.indexOf(".");
    return idx >= 0 ? s.length - idx - 1 : 0;
  }, [step]);

  const fmt = (n: number) => parseFloat(n.toFixed(decimals));

  const computeNewValue = (startPosition: {x: number, y: number}, currentPosition: {x: number, y: number}) => {
      let dy = startPosition.y - currentPosition.y;
      const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
      dy = clamp(dy,-DEFAULT_PX_FOR_FULL_RANGE, DEFAULT_PX_FOR_FULL_RANGE);
      dy = dy / DEFAULT_PX_FOR_FULL_RANGE;
      const min = rest.min ?? 0;
      const max = rest.max ?? 100;
      const range = max - min;
      const newVal = clamp(startValue + range * dy, min, max);
      return fmt(newVal);
  }

  useEffect(()=>{
    console.log("DraggingNumberInput useEffect called");
    const up = (e: PointerEvent) => {
      if (ref.current) {
        ref.current.releasePointerCapture(e.pointerId);
      } else {
        console.warn("captureRef.current is null, cannot release pointer capture");
      }

      if (startPositionRef.current === null) {
        setInactive();
        return;
      };
      const currentPosition = { x: e.clientX, y: e.clientY };
      const newVal = computeNewValue(startPositionRef.current, currentPosition);
      setValue(newVal);
      if (rest.onCommit) {
        rest.onCommit(newVal);
      } else if (rest.onChange) {
        rest.onChange(newVal);
      }
      startPositionRef.current = null;
      setInactive();

    }
    const move = (e: PointerEvent) => {
      if (startPositionRef.current === null) {

        console.log("startPosition is null, setting it now",{ x: e.clientX, y: e.clientY });
        startPositionRef.current = ({ x: e.clientX, y: e.clientY });
        const pointer = e.pointerId;
        if (ref.current) {
          ref.current.setPointerCapture(pointer);
        } else {
          console.warn("captureRef.current is null, cannot set pointer capture");
        }
        return;
      } else {
        const currentPosition = { x: e.clientX, y: e.clientY };
        const newVal = computeNewValue(startPositionRef.current, currentPosition);
        setValue(newVal);
        if (rest.onChange) {
          rest.onChange(newVal);
        }
      }
    }
    const capture = ref.current;
    if (!capture) return;
    capture.addEventListener("pointerup", up);
    capture.addEventListener("pointermove", move);
    return () => {
      capture.removeEventListener("pointermove", move);
      capture.removeEventListener("pointerup", up);

    }
  },[ref.current])

  return createPortal(
      <div 
      ref={ref}
      style={{

        borderRadius: "25px",
        backgroundColor: rest.bgColor || "var(--gray3)",
        color: rest.color || "var(--gray7)",
        cursor: "ns-resize",
        height: `${DEFAULT_PX_FOR_FULL_RANGE}px`,
        position: "absolute",
        top: `calc(${rest.top}px + calc(1em - ${DEFAULT_PX_FOR_FULL_RANGE / 2}px))`,
        left: rest.left,
        width: "10ch",
        //filter: "blur(2px)",
        boxShadow: `0 0 15px rgba(0,0,0,0.3)`,
        //border: `1px solid ${rest.color || "var(--gray7)"}`,
        overflow:"hidden",
      }}>
        <div style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          boxShadow: `inset 0 0 3px ${rest.color || "var(--gray7)"}`,
          borderRadius: "25px",
          opacity: 0.3,
        }}>
                </div>
        <div style={{
          position: "absolute",
          //backgroundColor: rest.color || "var(--gray7)",
          // gradient: "linear-gradient(to top, rgba(0,0,0,0.1), transparent)",
          background: `linear-gradient(to top, transparent -20%, ${rest.color || "var(--gray7)"} 100%)`,
          opacity: 0.5,
          width: "100%",
          height: `${DEFAULT_PX_FOR_FULL_RANGE * percent}px`,
          bottom: 0,
          left: 0,
          //filter: "blur(2px)",
        }}>
        </div>
              <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) scale(${rest.hoverScale || DEFAULT_HOVER_SCALE})`,
        transformOrigin: "center",
        color: rest.hoverColor || "var(--gray7)",
        textShadow:  "0 0px 8px rgba(0,0,0,0.35)",
        fontWeight: 500,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {value}
      </div>

      </div>,document.body)
}


function DraggingNumberInput(props: NumInputProps & {
  value: number;
  setValue: (n: number) => void;
  setInactive: () => void;
}) {

    const { value, setValue, setInactive, ...rest } = props;

  const captureRef = React.useRef<HTMLDivElement>(null);
  const [portalPos,setPortalPos] = useState<{top: number, left: number}>({top: 0, left: 0});
  useLayoutEffect(() => {
    if (captureRef.current) {
      const rect = captureRef.current.getBoundingClientRect();
      //console.log("Bounding rect:", rect);
      setPortalPos({
        top: rect.top,
        left: rect.left,
      });
    } else {
      console.warn("captureRef.current is null, cannot get bounding rect");
    }
  }, [captureRef.current]); 



  return (
    <div 
    ref={captureRef}
    style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "var(--borderRadiusSmall)",
        color: rest.color || "var(--gray7)",
        cursor: "ns-resize",
        width: "10ch",
        height: "2em",
        position: "relative",
    }}
    >
      <ProgressDisplayPortal 
        top={portalPos.top}
        left={portalPos.left}
        {...props}
        value={value}
      />
    </div>
  )


}



// function SimpleCommittedNumberInput({
//   onCommit,
//   onChange,
//   initialValue = 0,
//   min,
//   max,
//   step,
//   dragPixelsForFullRange = DEFAULT_PX_FOR_FULL_RANGE,
//   hoverScale = DEFAULT_HOVER_SCALE,
//   hoverColor = "var(--gray12)",
//   hoverShadow = "0 4px 12px rgba(0,0,0,0.35)",
//   hoverOffsetMax = DEFAULT_HOVER_OFFSET_MAX,
//   color = "var(--gray7)",
//   bgColor = "var(--gray3)",
//   bgActive = "var(--gray4)",
//   bgInvalidInput = "var(--danger)",
//   invalidInputColor = "var(--gray2)",
//   charSize,
//   maxCharSize = 50,
// }: NumInputProps & { setExternalValue: (n: number) => void }) {
//   /* helpers ------------------------------------------------------------- */
//   const decimals = React.useMemo(() => {
//     if (step == null) return 6;
//     const s = step.toString();
//     const idx = s.indexOf(".");
//     return idx >= 0 ? s.length - idx - 1 : 0;
//   }, [step]);

//   const fmt = (n: number) => parseFloat(n.toFixed(decimals));

//   const aligned = (x: number) =>
//     step == null ||
//     Math.abs(((x - (min ?? 0)) / step) - Math.round((x - (min ?? 0)) / step)) <
//       EPS;

//   const inRange = (x: number) =>
//     (min == null || x >= min) && (max == null || x <= max);

//   const isValid = (x: number) => !Number.isNaN(x) && inRange(x);

//   const pxPerStep = React.useMemo(() => {
//     if (step == null) return 5;
//     if (min != null && max != null) {
//       const steps = (max - min) / step || 1;
//       return Math.min(20, Math.max(0.1, dragPixelsForFullRange / steps));
//     }
//     return 5;
//   }, [step, min, max, dragPixelsForFullRange]);
//   ////console.log(pxPerStep);

//   /* refs & state -------------------------------------------------------- */
//   const inputRef = React.useRef<HTMLInputElement>(null);
//   const startPtr = React.useRef<{ x: number; y: number; base: number } | null>(
//     null,
//   );
//   const draggingRef = React.useRef(false);

//   const {
//     value: v,
//     setValue: setVal,
//     setActive,
//     active,
//   } = useHybridState(initialValue);
  
//   const display = String(v);
//   //const [display, setDisplayState] = React.useState<string>(String(initialValue));
//   const [editing, setEditing] = React.useState(false);
//   const [dragging, setDragging] = React.useState(false);
//   const [valid, setValid] = React.useState(true);
//   const [floatOff, setFloat] = React.useState<[number, number]>([0, 0]);
//   const [chars, setChars] = React.useState(
//     charSize ?? Math.min(String(initialValue).length, maxCharSize),
//   );

//   // const displayRef = React.useRef(display);
//   // const setDisplay = (s: string) => {
//   //   setDisplayState(s);
//   //   displayRef.current = s;
//   // };

//   /* callbacks ----------------------------------------------------------- */
//   const push = (n: number, committed: boolean) => {
//     if (committed) {
//       return onCommit ? onCommit(n) : onChange?.(n);
//     } else {
//       // not committed, we update only if we arent in editing mode
//       if (editing) return;
//       onChange?.(n);
//     }
//   };

//   const endDrag = () => {
//     setDragging(false);
//     setActive(false);
//     setFloat([0, 0]);
//     draggingRef.current = false;
//     document.body.style.cursor = "";

//   };

//   /* typing mode --------------------------------------------------------- */
//   const commitEditing = (n : number) => {
//     //const n = parseFloat(displayRef.current);
//     if (isValid(n)) {
//       const clean = fmt(n);
//       setVal(clean);
//       //setDisplay(String(clean));
//       push(clean, true);
//     } else {
//       //setDisplay(String(v));
//     }
//     setEditing(false);
//     setActive(false);
//   };

//   const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
//     const txt = e.target.value;
//     const n = parseFloat(txt);
//     setVal(n);
//     //setDisplay(txt);
//     if (charSize == null) setChars(Math.min(txt.length, maxCharSize));

//     const ok = isValid(n);
//     setValid(ok);
//     if (ok && !onCommit) push(n, false);
//   };

//   /* drag logic ---------------------------------------------------------- */
//   const move = (ev: MouseEvent) => {
//     if (!startPtr.current) return;

//     const dy = startPtr.current.y - ev.clientY;
//     const dx = ev.clientX - startPtr.current.x;

//     if (
//       !draggingRef.current &&
//       (Math.abs(dy) > DRAG_THRESHOLD || Math.abs(dx) > DRAG_THRESHOLD)
//     ) {
//       draggingRef.current = true;
//       setDragging(true)
//       setActive(true);
//       document.body.style.cursor = "ns-resize";
//     }

//     if (!draggingRef.current) return;

//     const rawSteps = dy / pxPerStep;
//     const delta = step ? Math.round(rawSteps) * step : rawSteps;
//     let next = startPtr.current.base + delta;

//     if (step) {
//       const b = min ?? 0;
//       next = b + Math.round((next - b) / step) * step;
//     }
//     if (min != null) next = Math.max(next, min);
//     if (max != null) next = Math.min(next, max);

//     next = fmt(next);

//     //setDisplay(String(next));
//     setVal(next);
//     setValid(true);

//     const offY = Math.max(-hoverOffsetMax, Math.min(hoverOffsetMax, dy * 0.25));
//     const offX = Math.max(-hoverOffsetMax, Math.min(hoverOffsetMax, dx * 0.25));
//     setFloat([offX, offY]);

//     if (!onCommit) push(next, false);
//   };

//   const up = () => {
//     window.removeEventListener("mousemove", move);
//     window.removeEventListener("mouseup", up);

//     if (draggingRef.current) {
//       commitEditing(); // reuses validation logic
//       endDrag();
//     } else {
//       /* it was a click → switch to editing mode */
//       setEditing(true);
//       setActive(true);
//       /* ensure controlled value goes into input */
//       setTimeout(() => {
//         inputRef.current?.focus();
//         inputRef.current?.select();
//       }, 0);
//     }
//     startPtr.current = null;
//   };

//   const down = (e: React.MouseEvent<HTMLDivElement>) => {
//     /* only when not editing */
//     if (editing) return;
//     e.preventDefault();
//     startPtr.current = { x: e.clientX, y: e.clientY, base: v };
//     draggingRef.current = false;
//     window.addEventListener("mousemove", move);
//     window.addEventListener("mouseup", up);
//   };

//   /* render -------------------------------------------------------------- */
//   const boxStyle: React.CSSProperties = {
//     backgroundColor:
//       editing || dragging ? (valid ? bgActive : bgInvalidInput) : bgColor,
//     color:
//       dragging ? "transparent" : editing ? (valid ? color : invalidInputColor) : color,
//     padding: "5px 10px",
//     borderRadius: "var(--borderRadiusSmall)",
//     minWidth: "100px",
//     fontSize: "16px",
//     border: "none",
//     cursor: editing? "text" : "ns-resize",
//     userSelect: "none",
//     transition: "background-color 0.1s",
//     display: "inline-block",
//   };

//   return (
//     <div style={{ position: "relative", display: "inline-block" }}
//     >
//       {editing ? (
//         <input
//           ref={inputRef}
//           type="text"
//           value={display}
//           size={chars}
//           style={{ ...boxStyle, 
//             color: valid ? color : invalidInputColor ,
//             padding: "8px 8px",
        
//         }}
//           onChange={onInputChange}
//           onBlur={commitEditing}
//           onKeyDown={(e) => e.key === "Enter" && commitEditing(e.target.value)}
//         />
//       ) : (
//         <div style={boxStyle} onMouseDown={down}>
//           {display}
//         </div>
//       )}

//       {dragging && (
//         <div
//           style={{
//             position: "absolute",
//             left: "50%",
//             transform: `translate(-100%,-100%)
//                         translate(${floatOff[0]}px,${-floatOff[1]}px)
//                         scale(${hoverScale})`,
//             transformOrigin: "center",
//             color: color,
//             textShadow: hoverShadow,
//             fontWeight: 500,
//             pointerEvents: "none",
//             willChange: "transform",
//             transition: "transform 0.04s linear",
//             userSelect: "none",
//           }}
//         >
//           {display}
//         </div>
//       )}
//     </div>
//   );
// }

export default SimpleCommittedNumberInput;
