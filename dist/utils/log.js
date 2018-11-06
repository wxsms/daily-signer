"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
exports.error = chalk_1.default.bold.red;
exports.warning = chalk_1.default.keyword('orange');
exports.success = chalk_1.default.green;
exports.mute = chalk_1.default.gray;
