import * as React from "react";

const SvgIcon: React.FC<React.SVGProps<SVGElement>> = (props: any) => {

  const { color = "var(--yellow3)", style } = props;
  return <div style={{
    width: "100px", 
    height: "100px",
    position: "relative",
    ...style,
  }}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    fillRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit="1.5"
    clipRule="evenodd"
    viewBox="0 0 1383 1384"
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
    }}
  >
    <g transform="translate(-11290 -51923)">
      <g id="Artboard10">
        <path
          fill="none"
          d="M11290.083 51923.766h1382.825v1382.824h-1382.825z"
        ></path>
        <path
          fill="none"
          stroke={color}
          strokeWidth="179.17"
          d="M11636.648 53004.745s-129.7-164.1-129.7-390.899 126.3-407.598 126.3-407.598"
        ></path>
        <path
          fill="none"
          stroke={color}
          strokeWidth="187.5"
          d="M11971.64 53053.006v-827.096"
        ></path>
        <path
          fill={color}
          d="m12205.948 52376.04 174.425-174.425 174.426 174.425-174.426 174.426z"
        ></path>
      </g>
    </g>
  </svg>
  </div>
};

export default SvgIcon;
