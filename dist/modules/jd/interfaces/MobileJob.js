"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Job_1 = require("../../../interfaces/Job");
const MobileAuth_1 = require("../auth/MobileAuth");
class MobileJob extends Job_1.default {
    constructor(user) {
        super(user);
        this.auth = new MobileAuth_1.default(user);
    }
    getCookies() {
        return this.auth.getSavedCookies();
    }
}
exports.default = MobileJob;
