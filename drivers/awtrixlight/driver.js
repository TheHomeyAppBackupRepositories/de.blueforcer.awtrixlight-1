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
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = require("homey");
const ManualAdd = false;
class UlanziAwtrix extends homey_1.Driver {
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('UlanziAwtrix has been initialized');
            this.homeyIp = yield this.homey.cloud.getLocalAddress();
            this.initFlows();
        });
    }
    initFlows() {
        return __awaiter(this, void 0, void 0, function* () {
            // Notification
            this.homey.flow.getActionCard('notification').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                const duration = typeof args.duration === 'number' ? Math.ceil(args.duration / 1000) : undefined;
                args.device.cmdNotify(args.msg, { color: args.color, duration, icon: args.icon });
            }));
            // Notification with icon
            this.homey.flow.getActionCard('notificationIcon').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                const duration = typeof args.duration === 'number' ? Math.ceil(args.duration / 1000) : undefined;
                args.device.cmdNotify(args.msg, { color: args.color, duration, icon: args.icon.id });
            })).getArgument('icon').registerAutocompleteListener((query, args) => __awaiter(this, void 0, void 0, function* () {
                return args.device.icons.find(query);
            }));
            // Sticky notification
            this.homey.flow.getActionCard('notificationSticky').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                const msg = args.msg || '';
                args.device.cmdNotify(msg, { color: args.color, hold: true, icon: args.icon });
            }));
            this.homey.flow.getActionCard('notificationDismiss').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                args.device.cmdDismiss();
            }));
            // Displau
            this.homey.flow.getActionCard('displaySet').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                args.device.cmdPower(args.power === '1');
            }));
            // RTTTL sound
            this.homey.flow.getActionCard('playRTTTL').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                args.device.cmdRtttl(args.rtttl);
            }));
            // Indicators
            this.homey.flow.getActionCard('indicator').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                args.device.cmdIndicator(args.indicator, { color: args.color, duration: args.duration, effect: args.effect });
            }));
            this.homey.flow.getActionCard('indicatorDismiss').registerRunListener((args) => __awaiter(this, void 0, void 0, function* () {
                args.device.cmdIndicator(args.indicator, {});
            }));
        });
    }
    onPair(session) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('onPair', session);
            const discoveryStrategy = this.getDiscoveryStrategy();
            const discoveryResults = discoveryStrategy.getDiscoveryResults();
            this.log(discoveryResults);
            session.setHandler('list_devices', () => __awaiter(this, void 0, void 0, function* () {
                const devices = Object.values(discoveryResults).map((discoveryResult) => {
                    return {
                        name: discoveryResult.id,
                        data: {
                            id: discoveryResult.id,
                        },
                        store: {
                            address: discoveryResult.address,
                        },
                        settings: {
                            user: null,
                            pass: null,
                        },
                    };
                });
                // If we do not find device, push custom one so user can set IP directly
                if (ManualAdd) {
                    devices.push({
                        name: 'Manual',
                        data: {
                            id: `custom_${Date.now().toString()}`,
                        },
                        store: {
                            address: '',
                        },
                        settings: {
                            user: null,
                            pass: null,
                        },
                    });
                }
                this.log(devices);
                return devices;
            }));
            session.setHandler('list_devices_selection', (data) => __awaiter(this, void 0, void 0, function* () {
                this.log('list_devices_selection', data);
                // let selectedDeviceId = data[0].data.id;
                // return selectedDeviceId;
            }));
            session.setHandler('get_device', (data) => __awaiter(this, void 0, void 0, function* () {
                this.log('get_device', data);
            }));
            session.setHandler('add_device', (data) => __awaiter(this, void 0, void 0, function* () {
                this.log('add_device', data);
            }));
        });
    }
}
exports.default = UlanziAwtrix;
module.exports = UlanziAwtrix;
