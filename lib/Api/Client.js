"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Client_instances, _Client_getApiUrl, _Client_getUrl, _Client_getRequest, _Client_translateStatusCode, _Client_getHeaders, _Client_requestError, _Client_debugInfo, _Client_debugError;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Response_1 = require("./Response");
const Timeout = 5000; // 5 seconds
const TimeoutUpload = Timeout * 2; // 4 seconds
const TimeoutRequest = Timeout / 2; // 2.5 seconds
function abortSignal(timeout) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
}
class Client {
    constructor(options) {
        _Client_instances.add(this);
        this.debug = false;
        this.user = '';
        this.pass = '';
        // eslint-disable-next-line no-console
        this.log = console.log;
        this.ip = options.ip;
        this.user = options.user || '';
        this.pass = options.pass || '';
        // eslint-disable-next-line no-console
        this.log = options.log || console.log;
    }
    setDebug(debug) {
        this.debug = debug;
    }
    setIp(ip) {
        this.ip = ip;
    }
    setCredentials(user, pass) {
        this.user = user;
        this.pass = pass;
    }
    get(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _Client_instances, "m", _Client_getRequest).call(this, __classPrivateFieldGet(this, _Client_instances, "m", _Client_getApiUrl).call(this, cmd));
        });
    }
    getDirect(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return __classPrivateFieldGet(this, _Client_instances, "m", _Client_getRequest).call(this, __classPrivateFieldGet(this, _Client_instances, "m", _Client_getUrl).call(this, path));
        });
    }
    post(cmd, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = __classPrivateFieldGet(this, _Client_instances, "m", _Client_getApiUrl).call(this, cmd);
            try {
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugInfo).call(this, 'POST: ', url);
                const result = yield axios_1.default.post(url, data, {
                    headers: __classPrivateFieldGet(this, _Client_instances, "m", _Client_getHeaders).call(this),
                    timeout: Timeout,
                    signal: abortSignal(TimeoutRequest),
                });
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugInfo).call(this, 'POST: ', url, result);
                return {
                    status: __classPrivateFieldGet(this, _Client_instances, "m", _Client_translateStatusCode).call(this, result.status),
                };
            }
            catch (error) {
                return __classPrivateFieldGet(this, _Client_instances, "m", _Client_requestError).call(this, error, url);
            }
        });
    }
    upload(path, form) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = __classPrivateFieldGet(this, _Client_instances, "m", _Client_getUrl).call(this, path);
            try {
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugInfo).call(this, 'POST(upload): ', url);
                const result = yield axios_1.default.post(url, form, {
                    headers: Object.assign(Object.assign({}, __classPrivateFieldGet(this, _Client_instances, "m", _Client_getHeaders).call(this)), form.getHeaders()),
                    timeout: TimeoutUpload,
                    signal: abortSignal(TimeoutRequest),
                });
                __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugInfo).call(this, 'POST(upload): ', url, result);
                return {
                    status: __classPrivateFieldGet(this, _Client_instances, "m", _Client_translateStatusCode).call(this, result.status),
                };
            }
            catch (error) {
                return __classPrivateFieldGet(this, _Client_instances, "m", _Client_requestError).call(this, error, url);
            }
        });
    }
}
_Client_instances = new WeakSet(), _Client_getApiUrl = function _Client_getApiUrl(path) {
    return __classPrivateFieldGet(this, _Client_instances, "m", _Client_getUrl).call(this, `api/${path}`);
}, _Client_getUrl = function _Client_getUrl(path) {
    return `http://${this.ip}/${path}`;
}, _Client_getRequest = function _Client_getRequest(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugInfo).call(this, 'GET: ', url);
            const result = yield axios_1.default.get(url, {
                headers: __classPrivateFieldGet(this, _Client_instances, "m", _Client_getHeaders).call(this),
                timeout: Timeout,
                signal: abortSignal(TimeoutRequest),
            });
            __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugInfo).call(this, 'GET: ', url, result);
            return {
                status: __classPrivateFieldGet(this, _Client_instances, "m", _Client_translateStatusCode).call(this, result.status),
                data: result.data,
            };
        }
        catch (error) {
            return __classPrivateFieldGet(this, _Client_instances, "m", _Client_requestError).call(this, error, url);
        }
    });
}, _Client_translateStatusCode = function _Client_translateStatusCode(code) {
    if (code >= 200 && code <= 400) {
        return Response_1.Status.Ok;
    }
    if (code === 401) {
        return Response_1.Status.AuthRequired;
    }
    if (code === 403) {
        return Response_1.Status.AuthFailed;
    }
    if (code === 404) {
        return Response_1.Status.NotFound;
    }
    return Response_1.Status.Error;
}, _Client_getHeaders = function _Client_getHeaders() {
    if (!this.user || !this.pass) {
        return {};
    }
    const token = Buffer.from(`${this.user}:${this.pass}`).toString('base64');
    return {
        Authorization: `Basic ${token}`,
    };
}, _Client_requestError = function _Client_requestError(error, url) {
    var _a;
    __classPrivateFieldGet(this, _Client_instances, "m", _Client_debugError).call(this, 'Result(error): ', url, error.message || error);
    // Device did not respond in time
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
        return {
            status: Response_1.Status.NotFound,
        };
    }
    let message = 'unknown error';
    let status = Response_1.Status.Error;
    if (axios_1.default.isAxiosError(error)) {
        message = error.message;
        status = __classPrivateFieldGet(this, _Client_instances, "m", _Client_translateStatusCode).call(this, ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500);
    }
    return {
        status,
        message,
    };
}, _Client_debugInfo = function _Client_debugInfo(message, url, args) {
    if (!this.debug) {
        return;
    }
    const dump = {};
    if (args) {
        dump.status = args.status;
        dump.statusText = args.statusText;
        dump.data = args.data;
        dump.headers = args.headers;
    }
    this.log(message, url, dump);
}, _Client_debugError = function _Client_debugError(message, url, arg) {
    if (!this.debug) {
        return;
    }
    this.log(message, url, arg);
};
exports.default = Client;
