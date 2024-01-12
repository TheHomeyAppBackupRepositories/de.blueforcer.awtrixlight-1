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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const form_data_1 = __importDefault(require("form-data"));
const Normalizer_1 = require("../Normalizer");
const Response_1 = require("./Response");
class Api {
    constructor(client, device) {
        this.client = client;
        this.device = device;
    }
    setCredentials(user, pass) {
        this.client.setCredentials(user, pass);
    }
    setIp(ip) {
        this.client.setIp(ip);
    }
    setDebug(debug) {
        this.client.setDebug(debug);
    }
    isAvaible() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.clientVerify()) === Response_1.Status.Ok;
        });
    }
    /** bckp ******* Commands ******* */
    dismiss() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('notify/dismiss');
        });
    }
    rtttl(melody) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('rtttl', melody);
        });
    }
    power(power) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('power', (0, Normalizer_1.powerOptions)({ power }));
        });
    }
    indicator(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost(`indicator${(0, Normalizer_1.indicatorNumber)(id)}`, (0, Normalizer_1.indicatorOptions)(options));
        });
    }
    appNext() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('nextapp');
        });
    }
    appPrev() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('previousapp');
        });
    }
    reboot() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('reboot');
        });
    }
    notify(msg, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('notify', (0, Normalizer_1.notifyOptions)(Object.assign(Object.assign({}, options), { text: msg })));
        });
    }
    setSettings(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientPost('settings', (0, Normalizer_1.settingOptions)(options));
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientGet('settings');
        });
    }
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientGet('stats');
        });
    }
    uploadImage(data, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = new form_data_1.default();
            form.append('image', data, { filepath: `/ICONS/${name}` });
            return this.clientUpload('edit', form);
        });
    }
    getImages() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientGetDirect('list?dir=/ICONS/');
        });
    }
    /** bckp ******* NETWORK LAYER  ******* */
    clientGet(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get(endpoint);
                this.processResponseCode(response.status, response.message);
                return response.data || null;
            }
            catch (error) {
                this.device.log(error);
                return null;
            }
        });
    }
    clientGetDirect(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.getDirect(endpoint);
                this.processResponseCode(response.status, response.message);
                return response.data || null;
            }
            catch (error) {
                this.device.log(error);
                return null;
            }
        });
    }
    clientPost(endpoint, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.post(endpoint, options);
            this.processResponseCode(response.status, response.message);
            return (response === null || response === void 0 ? void 0 : response.status) === Response_1.Status.Ok;
        });
    }
    clientUpload(endpoint, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.upload(endpoint, data);
            this.processResponseCode(response.status, response.message);
            return (response === null || response === void 0 ? void 0 : response.status) === Response_1.Status.Ok;
        });
    }
    clientVerify(verify = false, user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user && pass) {
                this.client.setCredentials(user, pass);
            }
            const response = yield this.client.get('stats');
            if (verify) {
                this.processResponseCode(response.status, response.message);
            }
            return response.status;
        });
    }
    processResponseCode(status, message) {
        switch (status) {
            case Response_1.Status.Ok:
                if (this.device.getAvailable()) {
                    return;
                }
                this.device.setAvailable().catch((error) => { var _a; return this.device.log((_a = error.message) !== null && _a !== void 0 ? _a : error); });
                this.device.failsReset();
                this.device.poll.start();
                return;
            case Response_1.Status.AuthRequired:
                this.processUnavailability(this.device.homey.__('api.error.loginRequired'));
                return;
            case Response_1.Status.AuthFailed:
                this.processUnavailability(this.device.homey.__('api.error.loginFailed'));
                return;
            default:
                this.processUnavailability(message !== null && message !== void 0 ? message : this.device.homey.__('api.error.unknownError'));
        }
    }
    processUnavailability(message) {
        if (this.device.failsExceeded()) {
            this.device.setUnavailable(message).catch((error) => this.device.log(error));
            this.device.poll.extend();
        }
        else {
            this.device.failsAdd();
        }
    }
}
exports.default = Api;
