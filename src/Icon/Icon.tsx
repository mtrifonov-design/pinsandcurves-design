import React from "react";


function Icon({
    iconName = "home",
    bgColor = "transparent",
    hoverBgColor = "var(--gray3)",
    color = "var(--gray6)",
    hoverColor= "var(--gray7)",
    cursor = "pointer",
    onClick = () => {},
    style={},
}) {
    const [hover, setHover] = React.useState(false);


    return (
        <div style={{...{
            userSelect: "none",
            width: "35px",
            height: "35px",
            margin: "5px",
            cursor,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            backgroundColor: hover ? hoverBgColor : bgColor,
            transition: "background-color 0.2s",
            fontSize: "20px",
            color: hover ? hoverColor : color,
        },...style}}
            className="materialSymbols"
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
         onClick={onClick}>
                <div> {iconName}</div>
        </div>
    )
}

export default Icon;