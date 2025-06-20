import React, { useRef } from "react";

const DEFAULT_PX_FOR_FULL_RANGE = 120;
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


function SimpleCommittedNumberInputWrapper(props: NumInputProps) {
  const [value, setValue] = React.useState(props.initialValue);
  const keyRef = useRef<string>(String(props.initialValue));
  console.log("SimpleCommittedNumberInputWrapper", props.initialValue, value, keyRef.current);
  if (props.initialValue !== value) {
    // Initial value changed externally
    keyRef.current = props.initialValue.toString();
  }
  return <SimpleCommittedNumberInput
    {...props}
    key={keyRef.current}
    setExternalValue={setValue}
  />

}


function SimpleCommittedNumberInput({
  onCommit,
  onChange,
  initialValue = 0,
  min,
  max,
  step,
  dragPixelsForFullRange = DEFAULT_PX_FOR_FULL_RANGE,
  hoverScale = DEFAULT_HOVER_SCALE,
  hoverColor = "var(--gray12)",
  hoverShadow = "0 4px 12px rgba(0,0,0,0.35)",
  hoverOffsetMax = DEFAULT_HOVER_OFFSET_MAX,
  color = "var(--gray7)",
  bgColor = "var(--gray3)",
  bgActive = "var(--gray4)",
  bgInvalidInput = "var(--danger)",
  invalidInputColor = "var(--gray2)",
  charSize,
  maxCharSize = 50,
  setExternalValue,
}: NumInputProps & { setExternalValue: (n: number) => void }) {
  /* helpers ------------------------------------------------------------- */
  const decimals = React.useMemo(() => {
    if (step == null) return 6;
    const s = step.toString();
    const idx = s.indexOf(".");
    return idx >= 0 ? s.length - idx - 1 : 0;
  }, [step]);

  const fmt = (n: number) => parseFloat(n.toFixed(decimals));

  const aligned = (x: number) =>
    step == null ||
    Math.abs(((x - (min ?? 0)) / step) - Math.round((x - (min ?? 0)) / step)) <
      EPS;

  const inRange = (x: number) =>
    (min == null || x >= min) && (max == null || x <= max);

  const isValid = (x: number) => !Number.isNaN(x) && aligned(x) && inRange(x);

  const pxPerStep = React.useMemo(() => {
    if (step == null) return 5;
    if (min != null && max != null) {
      const steps = (max - min) / step || 1;
      return Math.min(20, Math.max(0.1, dragPixelsForFullRange / steps));
    }
    return 5;
  }, [step, min, max, dragPixelsForFullRange]);
  ////console.log(pxPerStep);

  /* refs & state -------------------------------------------------------- */
  const inputRef = React.useRef<HTMLInputElement>(null);
  const startPtr = React.useRef<{ x: number; y: number; base: number } | null>(
    null,
  );
  const draggingRef = React.useRef(false);

  const [value, setVal] = React.useState<number>(initialValue);
  
  const [display, setDisplayState] = React.useState<string>(String(initialValue));
  const [editing, setEditing] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [valid, setValid] = React.useState(true);
  const [floatOff, setFloat] = React.useState<[number, number]>([0, 0]);
  const [chars, setChars] = React.useState(
    charSize ?? Math.min(String(initialValue).length, maxCharSize),
  );

  const displayRef = React.useRef(display);
    const setDisplay = (s: string) => {
    setDisplayState(s);
    displayRef.current = s;
  };

  /* callbacks ----------------------------------------------------------- */
  const push = (n: number, committed: boolean) => {
    setExternalValue(n);
    return committed && onCommit ? onCommit(n) : onChange?.(n)
  };

  const endDrag = () => {
    setDragging(false);
    setFloat([0, 0]);
    draggingRef.current = false;
    document.body.style.cursor = "";

  };

  /* typing mode --------------------------------------------------------- */
  const commitEditing = () => {
    //console.log("committing", display);
    const n = parseFloat(displayRef.current);
    if (isValid(n)) {
      const clean = fmt(n);
      setVal(clean);
      setDisplay(String(clean));
      //console.log("committed", clean,value,display);
      push(clean, true);
    } else {
      setDisplay(String(value));
    }
    setEditing(false);
  };

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const txt = e.target.value;
    setDisplay(txt);
    if (charSize == null) setChars(Math.min(txt.length, maxCharSize));
    const n = parseFloat(txt);
    const ok = isValid(n);
    setValid(ok);
    if (ok && !onCommit) push(n, false);
  };

  /* drag logic ---------------------------------------------------------- */
  const move = (ev: MouseEvent) => {
    if (!startPtr.current) return;

    const dy = startPtr.current.y - ev.clientY;
    const dx = ev.clientX - startPtr.current.x;

    if (
      !draggingRef.current &&
      (Math.abs(dy) > DRAG_THRESHOLD || Math.abs(dx) > DRAG_THRESHOLD)
    ) {
      draggingRef.current = true;
      setDragging(true);
      document.body.style.cursor = "ns-resize";
    }

    if (!draggingRef.current) return;

    const rawSteps = dy / pxPerStep;
    const delta = step ? Math.round(rawSteps) * step : rawSteps;
    let next = startPtr.current.base + delta;

    if (step) {
      const b = min ?? 0;
      next = b + Math.round((next - b) / step) * step;
    }
    if (min != null) next = Math.max(next, min);
    if (max != null) next = Math.min(next, max);

    next = fmt(next);

    setDisplay(String(next));
    setValid(true);

    const offY = Math.max(-hoverOffsetMax, Math.min(hoverOffsetMax, dy * 0.25));
    const offX = Math.max(-hoverOffsetMax, Math.min(hoverOffsetMax, dx * 0.25));
    setFloat([offX, offY]);

    if (!onCommit) push(next, false);
    //console.log("move", display)
  };

  const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);

    if (draggingRef.current) {
        //console.log("up",display)
      commitEditing(); // reuses validation logic
      endDrag();
    } else {
      /* it was a click → switch to editing mode */
      setEditing(true);
      /* ensure controlled value goes into input */
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
    startPtr.current = null;
  };

  const down = (e: React.MouseEvent<HTMLDivElement>) => {
    /* only when not editing */
    if (editing) return;
    startPtr.current = { x: e.clientX, y: e.clientY, base: value };
    draggingRef.current = false;
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  /* render -------------------------------------------------------------- */
  const boxStyle: React.CSSProperties = {
    backgroundColor:
      editing || dragging ? (valid ? bgActive : bgInvalidInput) : bgColor,
    color:
      dragging ? "transparent" : editing ? (valid ? color : invalidInputColor) : color,
    padding: "5px 10px",
    borderRadius: "var(--borderRadiusSmall)",
    minWidth: "100px",
    fontSize: "16px",
    border: "none",
    cursor: dragging ? "ns-resize" : "text",
    userSelect: "none",
    transition: "background-color 0.1s",
    display: "inline-block",
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={display}
          size={chars}
          style={{ ...boxStyle, 
            color: valid ? color : invalidInputColor ,
            padding: "8px 8px",
        
        }}
          onChange={onInputChange}
          onBlur={commitEditing}
          onKeyDown={(e) => e.key === "Enter" && commitEditing()}
        />
      ) : (
        <div style={boxStyle} onMouseDown={down}>
          {display}
        </div>
      )}

      {dragging && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: `translate(-100%,-100%)
                        translate(${floatOff[0]}px,${-floatOff[1]}px)
                        scale(${hoverScale})`,
            transformOrigin: "center",
            color: color,
            textShadow: hoverShadow,
            fontWeight: 500,
            pointerEvents: "none",
            willChange: "transform",
            transition: "transform 0.04s linear",
            userSelect: "none",
          }}
        >
          {display}
        </div>
      )}
    </div>
  );
}

export default SimpleCommittedNumberInputWrapper;
