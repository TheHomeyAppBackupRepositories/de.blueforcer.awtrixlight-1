"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Poll {
    constructor(callback, homey, interval = 30000, failsafe = 18000000) {
        this.extended = false;
        this.callback = callback;
        this.homey = homey;
        this.interval = interval;
        this.failsafe = failsafe;
    }
    start() {
        this.stop();
        this.poll = this.homey.setInterval(() => this.callback(), this.interval);
    }
    extend() {
        this.stop();
        this.extended = true;
        this.poll = this.homey.setInterval(() => this.callback(), this.failsafe);
    }
    stop() {
        this.extended = false;
        this.homey.clearTimeout(this.poll);
    }
    isActive() {
        return !!this.poll;
    }
    isExtended() {
        return this.extended;
    }
}
exports.default = Poll;
