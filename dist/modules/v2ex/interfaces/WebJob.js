"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Job_1 = require("../../../interfaces/Job");
const WebAuth_1 = require("../auth/WebAuth");
class WebJob extends Job_1.default {
    constructor(user) {
        super(user);
        this.auth = new WebAuth_1.default(user);
    }
    getCookies() {
        return this.auth.getSavedCookies();
    }
}
exports.default = WebJob;
