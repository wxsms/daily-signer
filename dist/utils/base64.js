"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function encode(str) {
    return Buffer.from(str).toString('base64');
}
exports.encode = encode;
function decode(str) {
    return Buffer.from(str, 'base64').toString('utf8');
}
exports.decode = decode;
