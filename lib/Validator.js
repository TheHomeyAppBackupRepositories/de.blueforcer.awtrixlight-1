"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIndicatorEffect = exports.isNumeric = exports.isColor = void 0;
const isColor = (color) => {
    if (typeof color === 'number' || typeof color === 'string') {
        return /^#[0-9A-F]{6}$/i.test(color.toString());
    }
    return false;
};
exports.isColor = isColor;
const isNumeric = (input) => {
    if (typeof input === 'string' || typeof input === 'number') {
        return Number.isNaN(Number.parseInt(input.toString(), 10));
    }
    return false;
};
exports.isNumeric = isNumeric;
const isIndicatorEffect = (effect) => {
    if (typeof effect === 'string') {
        return effect === 'blink' || effect === 'fade';
    }
    return false;
};
exports.isIndicatorEffect = isIndicatorEffect;
