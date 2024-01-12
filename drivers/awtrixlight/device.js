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
const fs_1 = __importDefault(require("fs"));
const homey_1 = require("homey");
const Client_1 = __importDefault(require("../../lib/Api/Client"));
const Response_1 = require("../../lib/Api/Response");
const Api_1 = __importDefault(require("../../lib/Api/Api"));
const Icons_1 = __importDefault(require("../../lib/List/Icons"));
const Poll_1 = __importDefault(require("../../lib/Poll"));
const RebootFields = ['TIM', 'DAT', 'HUM', 'TEMP', 'BAT'];
const PollInterval = 60000; // 1 minute
const PollIntervalLong = 300000; // 5 minutes
class AwtrixLightDevice extends homey_1.Device {
    constructor() {
        super(...arguments);
        this.failCritical = false;
        this.failCount = 0;
        this.failThreshold = 3;
    }
    /**
     * onInit is called when the device is initialized.
     */
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('AwtrixLightDevice has been initialized');
            try {
                yield this.setUnavailable(this.homey.__('loading'));
                yield this.migrate();
            }
            catch (error) {
                this.error(error.message || error);
            }
            // Setup flows
            this.initFlows();
            // Create API
            this.api = new Api_1.default(new Client_1.default({ ip: this.getStoreValue('address') }), this);
            // this.api.setDebug(true);
            // Create icons service
            this.icons = new Icons_1.default(this.api, this);
            // Setup polling
            this.poll = new Poll_1.default(() => __awaiter(this, void 0, void 0, function* () {
                this.log('polling...');
                this.refreshCapabilities();
                if (!this.getAvailable()) {
                    this.tryRediscover();
                }
            }), this.homey, PollInterval, PollIntervalLong);
            // Initialize API etc
            this.initializeDevice();
        });
    }
    initializeDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup user and pass if exists
            const settings = yield this.getSettings();
            if (settings.user && settings.pass) {
                this.log('Setting user and pass');
                this.api.setCredentials(settings.user, settings.pass);
            }
            // Test device if possible
            if (!(yield this.testDevice())) {
                this.log('Device not available, trying to rediscover');
                this.setUnavailable(this.homey.__('states.unavailable')).catch(this.error);
                this.tryRediscover();
            }
            else {
                yield this.setAvailable();
            }
            this.poll.stop();
            // Setup polling
            try {
                this.failsReset();
                this.failsCritical(true);
                if (this.getAvailable()) {
                    this.log('Device availalible');
                    this.refreshAll();
                    this.connected();
                }
                else {
                    this.log('Polling set to extended mode, device is not available');
                }
            }
            finally {
                this.poll.start();
                this.failsCritical(false);
            }
            this.registerCapabilityListener('button.rediscover', () => __awaiter(this, void 0, void 0, function* () {
                this.log('Rediscover button pressed');
                try {
                    // Device is OK, no need to rediscover
                    if ((yield this.api.clientVerify()) === Response_1.Status.Ok) {
                        return;
                    }
                    // Try to rediscover
                    if (yield this.tryRediscover()) {
                        this.setCapabilityValue('ip', this.getStoreValue('address'));
                        return;
                    }
                }
                catch (error) {
                    this.error(error);
                }
                throw new Error('Rediscovery failed');
            }));
        });
    }
    /**
     * onAdded is called when the user adds the device, called just after pairing.
     */
    onAdded() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('AwtrixLightDevice has been added');
            this.connected();
            this.setCapabilityValue('ip', this.getStoreValue('address'));
            // Upload files
            fs_1.default.readdir(`${__dirname}/assets/images/icons`, (err, files) => {
                if (files) {
                    files.forEach((file) => this.api.uploadImage(fs_1.default.readFileSync(`${__dirname}/assets/images/icons/${file}`), file));
                }
                if (err) {
                    this.log(err);
                }
            });
        });
    }
    onSettings({ oldSettings, newSettings, changedKeys }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('AwtrixLightDevice settings where changed', oldSettings, newSettings, changedKeys);
            // If user or pass changed, update credentials
            if (typeof newSettings.user === 'string' && typeof newSettings.pass === 'string') {
                if (!(yield this.testDevice(newSettings.user, newSettings.pass))) {
                    this.api.setCredentials(typeof oldSettings.user === 'string' ? oldSettings.user : '', typeof oldSettings.pass === 'string' ? oldSettings.pass : '');
                    throw new Error(this.homey.__('login.invalidCredentials'));
                }
                // Enable pooling if not
                if (!this.poll.isActive()) {
                    this.poll.start();
                }
            }
            this.api.setSettings(newSettings).catch(this.error);
            if (RebootFields.some((key) => changedKeys.includes(key))) {
                this.log('rebooting device');
                yield this.api.reboot().catch(this.error);
            }
        });
    }
    /**
     * onDeleted is called when the user deleted the device.
     */
    onDeleted() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('AwtrixLightDevice has been deleted');
            this.poll.stop();
        });
    }
    onDiscoveryResult(discoveryResult) {
        return discoveryResult.id === this.getData().id;
    }
    onDiscoveryAvailable(discoveryResult) {
        return __awaiter(this, void 0, void 0, function* () {
            if ('address' in discoveryResult && this.getStoreValue('address') !== discoveryResult.address) {
                if (yield this.onDiscoveryAddressChanged(discoveryResult)) {
                    yield this.setAvailable();
                    return true;
                }
            }
            return false;
        });
    }
    onDiscoveryAddressChanged(discoveryResult) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set IP
            this.api.setIp(discoveryResult.address);
            this.setStoreValue('address', discoveryResult.address).catch((error) => this.error(error));
            this.setCapabilityValue('ip', discoveryResult.address);
            // Verify
            try {
                return yield this.testDevice();
            }
            catch (error) {
                this.error(error);
            }
            return false;
        });
    }
    refreshAll() {
        this.refreshCapabilities();
        this.refreshSettings();
        this.refreshApps();
    }
    tryRediscover() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = this.driver.getDiscoveryStrategy().getDiscoveryResult(this.getData().id);
                if (result && result instanceof homey_1.DiscoveryResultMDNSSD && result.address) {
                    return this.onDiscoveryAvailable(result);
                }
            }
            catch (error) {
                this.log('Discovery error: ', error);
            }
            return false;
        });
    }
    // Refresh device capabilities, this is expensive so we do not want to poll too often
    refreshCapabilities() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.cmdGetStats();
                this.log('refreshCapabilities', stats);
                if (!stats) {
                    this.log('status endpoint failed');
                    return;
                }
                yield this.setCapabilityValues({
                    // Battery
                    measure_battery: stats.bat,
                    // Measurements
                    measure_humidity: stats.hum,
                    measure_luminance: stats.lux,
                    measure_temperature: stats.temp,
                    // Indicators
                    'alarm_generic.indicator1': !!stats.indicator1,
                    'alarm_generic.indicator2': !!stats.indicator2,
                    'alarm_generic.indicator3': !!stats.indicator3,
                    // Display
                    awtrix_matrix: !!stats.matrix,
                    // RSSI
                    rssi: stats.wifi_signal,
                });
                if (stats.uptime <= this.getStoreValue('uptime')) {
                    this.log('reboot detected');
                    // this.refreshApps().catch(this.error);
                }
                yield this.setStoreValue('uptime', stats.uptime);
            }
            catch (error) {
                this.log(error.message || error);
            }
        });
    }
    refreshSettings() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.cmdGetSettings();
                if (!settings) {
                    this.log('settings endpoint failed');
                    return;
                }
                this.setSettings({
                    TIM: !!settings.TIM,
                    DAT: !!settings.DAT,
                    HUM: !!settings.HUM,
                    TEMP: !!settings.TEMP,
                    BAT: !!settings.BAT,
                    ABRI: !!settings.ABRI,
                    ATRANS: !!settings.ATRANS,
                    BLOCKN: !!settings.BLOCKN,
                    UPPERCASE: !!settings.UPPERCASE,
                    TEFF: (_a = settings === null || settings === void 0 ? void 0 : settings.TEFF) === null || _a === void 0 ? void 0 : _a.toString(),
                });
            }
            catch (error) {
                this.log(error.message || error);
            }
        });
    }
    connected() {
        this.api.notify('HOMEY', { color: '#FFFFFF', duration: '2', icon: 'homey' });
    }
    refreshApps() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
            /*
            const homeyApps = this.getStoreKeys().filter((key) => DataNormalizer.isHomeyApp(key));
            const awtrixApps = this.api.getApps().then((apps) => {
        
              //TODO: verify all apps are ok, or we need to resync them
            });
            return awtrixApps;
            */
        });
    }
    initFlows() {
        // Matrix
        this.registerCapabilityListener('awtrix_matrix', (value) => __awaiter(this, void 0, void 0, function* () { return this.cmdPower(value); }));
        // Buttons
        this.registerCapabilityListener('button_next', () => __awaiter(this, void 0, void 0, function* () { return this.cmdAppNext(); }));
        this.registerCapabilityListener('button_prev', () => __awaiter(this, void 0, void 0, function* () { return this.cmdAppPrev(); }));
    }
    testDevice(user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.api.clientVerify(true, user, pass).catch(this.error);
            if (status === Response_1.Status.Ok) {
                return true;
            }
            return false;
        });
    }
    migrate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('Migrating device...');
            this.log('onInit', this.getCapabilities());
            const capabilities = this.getCapabilities();
            try {
                // Only reset capabilities if they are in bad order
                if (!(capabilities.indexOf('awtrix_matrix') > capabilities.indexOf('button_next')
                    && capabilities.indexOf('button_next') > capabilities.indexOf('button_prev'))) {
                    this.log('Capabilities are in bad order, resetting...');
                    if (capabilities.includes('button_prev')) {
                        yield this.removeCapability('button_prev');
                        this.log('removed capability button_prev');
                    }
                    if (capabilities.includes('button_next')) {
                        yield this.removeCapability('button_next');
                        this.log('removed capability button_next');
                    }
                    if (capabilities.includes('awtrix_matrix')) {
                        yield this.removeCapability('awtrix_matrix');
                        this.log('removed capability awtrix_matrix');
                    }
                    // Re/add in correct order
                    this.log('re-add capabilities');
                    yield this.addCapability('button_prev');
                    yield this.addCapability('button_next');
                    yield this.addCapability('awtrix_matrix');
                }
                // Add rssi capability if not exists
                if (!capabilities.includes('rssi')) {
                    yield this.addCapability('rssi');
                    this.log('added capability rssi');
                }
                // Add rssi capability if not exists
                if (!capabilities.includes('ip')) {
                    yield this.addCapability('ip');
                    yield this.setCapabilityValue('ip', this.getStoreValue('address'));
                    this.log('added capability ip');
                }
                // Add rediscover
                if (!capabilities.includes('button.rediscover')) {
                    yield this.addCapability('button.rediscover');
                }
            }
            catch (error) {
                this.error(error);
            }
        });
    }
    /** bckp ******* Commands ******* */
    cmdNotify(msg, params) {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.notify(msg, params).catch(this.error);
        });
    }
    cmdDismiss() {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.dismiss().catch(this.error);
        });
    }
    cmdRtttl(melody) {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.rtttl(melody).catch(this.error);
        });
    }
    cmdPower(power) {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.power(power).catch(this.error);
        });
    }
    cmdIndicator(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.indicator(id, options).catch(this.error);
        });
    }
    cmdAppNext() {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.appNext().catch(this.error);
        });
    }
    cmdAppPrev() {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.appPrev().catch(this.error);
        });
    }
    cmdReboot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.reboot().catch(this.error);
        });
    }
    cmdSetSettings(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.api.setSettings(options).catch(this.error);
        });
    }
    cmdGetSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.api.getSettings();
            }
            catch (error) {
                this.error(error);
                return null;
            }
        });
    }
    cmdGetStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.api.getStats();
            }
            catch (error) {
                this.error(error);
                return null;
            }
        });
    }
    cmdGetImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.api.getImages();
            }
            catch (error) {
                this.error(error);
                return null;
            }
        });
    }
    setCapabilityValues(values) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(values).map((key) => this.setCapabilityValue(key, values[key]).catch(this.error));
        });
    }
    /** bckp ******* API related ****** */
    failsReset() {
        this.failCount = 0;
    }
    failsAdd() {
        this.failCount++;
    }
    failsExceeded() {
        return this.failCritical || this.failCount >= this.failThreshold;
    }
    failsCritical(value) {
        this.failCritical = value;
    }
}
exports.default = AwtrixLightDevice;
module.exports = AwtrixLightDevice;
