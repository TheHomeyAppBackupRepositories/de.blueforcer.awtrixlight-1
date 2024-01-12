"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
var Status;
(function (Status) {
    Status[Status["Ok"] = 0] = "Ok";
    Status[Status["AuthRequired"] = 1] = "AuthRequired";
    Status[Status["AuthFailed"] = 2] = "AuthFailed";
    Status[Status["NotFound"] = 3] = "NotFound";
    Status[Status["Error"] = 4] = "Error";
})(Status || (exports.Status = Status = {}));
