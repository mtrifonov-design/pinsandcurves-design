import React from "react";
import { Icon } from "..";


function Button({
    text = undefined,
    iconName = undefined,
    bgColor = "var(--gray3)",
    hoverBgColor = "var(--gray4)",
    color = "var(--gray7)",
    hoverColor= "var(--gray8)",
    cursor = "pointer",
    onClick = () => {},
} : {
    text?: string,
    iconName?: string,
    bgColor?: string,
    hoverBgColor?: string,
    color?: string,
    hoverColor?: string,
    cursor?: string,
    onClick?: () => void,
}) {
    const [hover, setHover] = React.useState(false);


    return (
        <button
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
        onClick={onClick}
        style={{
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0px",
            cursor,
            height: "35px",
            margin: "5px",
            userSelect: "none",

            backgroundColor: hover ? hoverBgColor : bgColor,
            transition: "background-color 0.2s",
            fontSize: "var(--defaultFontSize)",
            color: hover ? hoverColor : color,
            border: "none",
            borderRadius: "5px",
        }}
        >

            {text ? 
                <div style={{
                    marginTop: "2px",
                    marginRight: iconName ? "2px" : "15px",
                    marginLeft: "15px",
    
                }}>
                    {text}
                </div>
            : null}


            {iconName ? 
                <div style={{
                    marginRight: text ? "0px" : "10px",
                    marginLeft: text ? "0px" : "10px",
                }}>
                    <Icon iconName={iconName} 
                        color = {hover ? hoverColor : color}
                        hoverColor = {hover ? hoverColor : color}
                        bgColor="transparent"
                        hoverBgColor="transparent"
                    />
                </div>

            : null}


        </button>

    )
}

export default Button;