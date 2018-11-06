"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
function default_1(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
exports.default = default_1;
