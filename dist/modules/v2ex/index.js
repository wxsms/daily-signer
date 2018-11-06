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
const WebAuth_1 = require("./auth/WebAuth");
const daily_sign_1 = require("./jobs/daily-sign");
const users = require('../../../config/user.json').v2ex;
function _runWebJobs(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new daily_sign_1.default(user).run();
    });
}
function runWebJobs(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new WebAuth_1.default(user);
        if (yield auth.check()) {
            yield _runWebJobs(user);
        }
        else {
            if (!user.skipLogin) {
                yield auth.login();
                yield _runWebJobs(user);
            }
        }
    });
}
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('开始【V2EX】任务');
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.skip) {
                continue;
            }
            console.log('用户：', user.username);
            yield runWebJobs(user);
        }
        console.log('【V2EX】任务已全部完成');
        console.log('-----------------');
    });
}
exports.default = default_1;
