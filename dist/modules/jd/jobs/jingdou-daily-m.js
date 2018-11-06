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
const auth = require("../auth/mobile");
const log_1 = require("../../../utils/log");
const puppeteer_1 = require("../../../utils/puppeteer");
const Job_1 = require("../../../interfaces/Job");
class JongdouDailyMobile extends Job_1.default {
    constructor(user) {
        super(user);
        this._run = () => __awaiter(this, void 0, void 0, function* () {
            const beanBefore = yield this.getCurrentBeanCount();
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://bean.m.jd.com/bean/signIndex.action');
            const beanAfter = yield this.getCurrentBeanCount();
            if (beanAfter === beanBefore) {
                console.log(log_1.mute('今日已签到'));
            }
            else {
                console.log(log_1.success(`签到成功，获得${beanAfter - beanBefore}个京豆`));
            }
            yield page.close();
        });
        this.name = '移动端每日签到';
        this.getCookies = auth.getSavedCookies;
    }
    getCurrentBeanCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://bean.m.jd.com/');
            const result = yield page.$('span[type="Bold"]');
            const resultText = yield page.evaluate(element => element.textContent, result);
            yield page.close();
            return parseInt(resultText);
        });
    }
    run() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
exports.default = JongdouDailyMobile;
