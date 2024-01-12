"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingOptions = exports.appOptions = exports.notifyOptions = exports.powerOptions = exports.appName = exports.indicatorNumber = exports.indicatorOptions = exports.isHomeyApp = void 0;
const Validator_1 = require("./Validator");
const appPrefix = 'homey:';
function isString(input) {
    return typeof input === 'string';
}
const toNumber = (input) => {
    return Number.parseInt(input.toString(), 10);
};
const minMaxNumber = (min, max, number) => {
    return Math.min(max, Math.max(min, toNumber(number)));
};
function isIndicatorEffect(effect) {
    if (typeof effect === 'string') {
        return effect === 'blink' || effect === 'fade';
    }
    return false;
}
function toNumericType(input, min, max) {
    if ((0, Validator_1.isNumeric)(input)) {
        return minMaxNumber(min, max, toNumber(input));
    }
    return min;
}
function toLifetimeMode(mode) {
    return toNumericType(mode, 0, 1);
}
function toTextCase(textCase) {
    return toNumericType(textCase, 0, 2);
}
function toPushIcon(pushIcon) {
    return toNumericType(pushIcon, 0, 2);
}
function toTransitionEffect(effect) {
    return toNumericType(effect, 0, 10);
}
function toColor(color) {
    if ((0, Validator_1.isColor)(color)) {
        return color;
    }
    return '0';
}
const isHomeyApp = (app) => {
    return app.startsWith(appPrefix);
};
exports.isHomeyApp = isHomeyApp;
// Public functions
const indicatorOptions = (options) => {
    const ret = {
        color: (0, Validator_1.isColor)(options.color) ? options.color : '0',
    };
    if ('effect' in options && isString(options.effect) && isIndicatorEffect(options.effect)) {
        ret[options.effect] = ('duration' in options && (0, Validator_1.isNumeric)(options.duration)) ? toNumber(options.duration) : 1000;
    }
    return ret;
};
exports.indicatorOptions = indicatorOptions;
const indicatorNumber = (id) => {
    return minMaxNumber(1, 3, toNumber(id));
};
exports.indicatorNumber = indicatorNumber;
const appName = (id) => {
    return `${appPrefix}${id.replace(/[^a-z0-9]+/g, '').toLowerCase()}`;
};
exports.appName = appName;
const powerOptions = (options) => {
    return {
        power: !!options.power,
    };
};
exports.powerOptions = powerOptions;
const basicOptions = (options) => {
    const opt = {};
    if (options.text && isString(options.text)) {
        opt.text = options.text;
    }
    if (options.textCase) {
        opt.textCase = toTextCase(options.textCase);
    }
    if (options.topText) {
        opt.topText = !!options.topText;
    }
    if (options.textOffset && (0, Validator_1.isNumeric)(options.textOffset)) {
        opt.textOffset = toNumber(options.textOffset);
    }
    if (options.center) {
        opt.center = !!options.center;
    }
    if (options.color) {
        opt.color = toColor(options.color);
    }
    if (options.gradient && options.gradient.length === 2 && (0, Validator_1.isColor)(options.gradient[0]) && (0, Validator_1.isColor)(options.gradient[1])) {
        opt.gradient = options.gradient;
    }
    if (options.background && (0, Validator_1.isColor)(options.background)) {
        opt.background = options.background;
    }
    if (options.rainbow) {
        opt.rainbow = !!options.rainbow;
    }
    // TODO: Add support for base64 icons, or rewrite this to use only base64 icons
    if (options.icon && options.icon !== '-') {
        opt.icon = options.icon.toString();
    }
    if (options.pushIcon) {
        opt.pushIcon = toPushIcon(options.pushIcon);
    }
    if (options.repeat && (0, Validator_1.isNumeric)(options.repeat)) {
        opt.repeat = toNumber(options.repeat);
    }
    if (options.duration && (0, Validator_1.isNumeric)(options.duration)) {
        opt.duration = toNumber(options.duration);
    }
    if (options.noScroll) {
        opt.noScroll = !!options.noScroll;
    }
    if (options.scrollSpeed && (0, Validator_1.isNumeric)(options.scrollSpeed)) {
        opt.scrollSpeed = toNumber(options.scrollSpeed);
    }
    /*
    blinkText?: number; // Blinks the text in an given interval, not compatible with gradient or rainbow
    fadeText?: number; // Fades the text on and off in an given interval, not compatible with gradient or rainbow
    progress?: number; // Shows a progress bar. Value can be 0-100.
    progressC?: Color; // The color of the progress bar.
    progressBC?: Color; // The color of the progress bar background.
    effect?: string; // Shows an effect as background.
    */
    return opt;
};
const notifyOptions = (options) => {
    const opt = basicOptions(options);
    if (options.hold) {
        opt.hold = !!options.hold;
    }
    if (options.rtttl && isString(options.rtttl)) {
        opt.rtttl = options.rtttl;
    }
    if (options.loopSound) {
        opt.loopSound = !!options.loopSound;
    }
    if (options.stack) {
        opt.stack = !!options.stack;
    }
    if (options.wakeup) {
        opt.wakeup = !!options.wakeup;
    }
    return opt;
};
exports.notifyOptions = notifyOptions;
const appOptions = (options) => {
    const opt = basicOptions(options);
    if (options.lifetime && (0, Validator_1.isNumeric)(options.lifetime)) {
        opt.lifetime = toNumber(options.lifetime);
    }
    if (options.lifetimeMode) {
        opt.lifetimeMode = toLifetimeMode(options.lifetimeMode);
    }
    return opt;
};
exports.appOptions = appOptions;
const defaultSettingsOptions = {
    ABRI: false,
    ATRANS: false,
    BAT: false,
    BLOCKN: false,
    DAT: false,
    HUM: false,
    TEFF: undefined,
    TEMP: false,
    TIM: false,
    UPPERCASE: false,
};
const settingOptions = (options) => {
    const opt = {};
    const _a = Object.assign(Object.assign({}, defaultSettingsOptions), options), { TEFF } = _a, optionalOptions = __rest(_a, ["TEFF"]);
    if (TEFF) {
        opt.TEFF = toTransitionEffect(TEFF);
    }
    for (const key in optionalOptions) {
        if (key in options) {
            opt[key] = !!options[key];
        }
    }
    return opt;
};
exports.settingOptions = settingOptions;
