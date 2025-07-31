const rgbToHsv = ({r, g, b}: RGBColor) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = undefined;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        if (h !== undefined) h /= 6;
    }
    return { h, s, v };
}

const hsvToRgb = ({h, s, v}: HSVColor) => {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
        default: throw new Error('Invalid HSV color');
    }
    return { r, g, b };
};

const rgbToHex = ({r, g, b}: RGBColor) => {
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error('Invalid RGB color');
    }
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r/255, g: g/255, b: b/255 };
}

type RGBColor = {
    r: number;
    g: number;
    b: number;
}
type HSVColor = {
    h: number;
    s: number;
    v: number;
}

export {
    rgbToHsv,
    hsvToRgb,
    rgbToHex,
    hexToRgb
}

export type {
    RGBColor,
    HSVColor
}