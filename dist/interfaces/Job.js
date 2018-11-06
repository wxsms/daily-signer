"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = require("../utils/log");
const browser_1 = require("../utils/browser");
class Job {
    constructor(user) {
        this.user = user;
        this.browser = browser_1.getBrowser();
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`开始【${this.name}】任务`);
            try {
                this.cookies = this.getCookies(this.user);
                yield this._run();
            }
            catch (e) {
                console.log(log_1.error('任务失败'), log_1.error(e.message));
            }
        });
    }
}
exports.default = Job;
