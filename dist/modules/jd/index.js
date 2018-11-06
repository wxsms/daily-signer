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
const MobileAuth_1 = require("./auth/MobileAuth");
const jingdou_daily_1 = require("./jobs/jingdou-daily");
const jingdou_shops_1 = require("./jobs/jingdou-shops");
const jingdou_daily_m_1 = require("./jobs/jingdou-daily-m");
const jinrong_daily_1 = require("./jobs/jinrong-daily");
const double_sign_1 = require("./jobs/double-sign");
const jingdou_zhuanpan_m_1 = require("./jobs/jingdou-zhuanpan-m");
const users = require('../../../config/user.json').jd;
function _runMobileJobs(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new jingdou_daily_m_1.default(user).run();
        yield new jingdou_zhuanpan_m_1.default(user).run();
        yield new double_sign_1.default(user).run();
    });
}
function _runWebJobs(user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new jingdou_daily_1.default(user).run();
        yield new jingdou_shops_1.default(user).run();
        yield new jinrong_daily_1.default(user).run();
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
function runMobileJobs(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new MobileAuth_1.default(user);
        if (yield auth.check()) {
            yield _runMobileJobs(user);
        }
        else {
            if (!user.skipLogin) {
                yield auth.login();
                yield _runMobileJobs(user);
            }
        }
    });
}
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('开始【京东商城】任务');
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.skip) {
                continue;
            }
            console.log('用户：', user.username);
            yield runWebJobs(user);
            yield runMobileJobs(user);
        }
        console.log('【京东商城】任务已全部完成');
        console.log('-----------------');
    });
}
exports.default = default_1;
