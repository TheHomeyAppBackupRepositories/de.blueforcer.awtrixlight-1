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
const path_1 = __importDefault(require("path"));
const Timeout = 120000; // 2 minutes
class Icons {
    constructor(api, device) {
        this.list = [];
        this.api = api;
        this.device = device;
        this.empty = {
            name: this.device.homey.__('list.icons.empty.name'),
            id: '-',
            description: this.device.homey.__('list.icons.empty.description'),
        };
    }
    find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.all()).filter((result) => {
                return result.name.toLowerCase().includes(query.toLowerCase());
            });
        });
    }
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.list.length === 0) {
                yield this.loadIcons();
            }
            this.resetTimer();
            return this.list;
        });
    }
    resetTimer() {
        this.device.homey.clearTimeout(this.timer);
        this.timer = this.device.homey.setTimeout(() => {
            this.list = [];
        }, Timeout);
    }
    loadIcons() {
        return __awaiter(this, void 0, void 0, function* () {
            const icons = (yield this.api.getImages().catch(this.device.error)) || [];
            this.list = [
                this.empty,
                ...icons.map((icon) => {
                    const value = path_1.default.parse(icon.name).name;
                    return {
                        name: value,
                        id: value,
                    };
                }),
            ];
        });
    }
}
exports.default = Icons;
