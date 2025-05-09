import React from 'react';

function SimpleCommittedTextInput({
    onCommit = (text: string) => {},
    isValid = (text: string) => true,
    initialValue = "",
    color = "var(--gray7)",
    bgColor = "var(--gray3)",
    bgActive = "var(--gray4)",
    bgInvalidInput = "var(--danger)",
    invalidInputColor = "var(--gray2)",
    charSize = undefined,
    maxCharSize = 50,
} : {
    onCommit?: (text: string) => void,
    isValid?: (text: string) => boolean,
    initialValue?: string,
    color?: string,
    bgColor?: string,
    bgActive?: string,
    bgInvalidInput?: string,
    invalidInputColor?: string,
    charSize?: number,
    maxCharSize?: number,
}) {

    const [editing, setEditing] = React.useState(false);
    const [valid, setValid] = React.useState(true);
    const generateId = () => Math.random().toString(36).substring(7);
    const [inputKey, setInputKey] = React.useState(generateId());
    const [currentCharSize, setCharSize] = React.useState(charSize ? charSize : initialValue.length <= maxCharSize ? initialValue.length : maxCharSize);

    const reset = () => {
        setEditing(false);
        setValid(true);
        setInputKey(generateId());
    }

    return (<input
                    key={inputKey}
                    type="text"
                    defaultValue={initialValue}
                    size={currentCharSize}
                    style={{
                        backgroundColor: editing ? valid ? bgActive : bgInvalidInput : bgColor,
                        color: valid? color : invalidInputColor,
                        border: "none",
                        padding: "5px",
                        paddingLeft: "10px",
                        borderRadius: "var(--borderRadiusSmall)",
                        minWidth: "100px",
                        fontSize: "16px",

                    }}
                    readOnly={!editing}
                    onFocus={() => setEditing(true)}
                    onChange={(e) => {
                        setValid(isValid(e.target.value));
                        if (!charSize) {
                            if (e.target.value.length <= maxCharSize) {
                                setCharSize(e.target.value.length);
                            } else {
                                setCharSize(maxCharSize);
                            }
                        }
                    }}
                    onBlur={(e) => {
                        if (valid) {
                            reset();
                            onCommit(e.target.value);
                        } else {
                            e.target.value = initialValue;
                            reset();
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (valid) {
                                reset();
                                onCommit((e.target as HTMLInputElement).value);
                            } else {
                                reset();
                            }
                        }
                    }}
                />
            

        
    )

}

export default SimpleCommittedTextInput;