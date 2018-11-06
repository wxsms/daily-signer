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
const log_1 = require("../../../utils/log");
const puppeteer_1 = require("../../../utils/puppeteer");
const WebJob_1 = require("../interfaces/WebJob");
class JinrongDaily extends WebJob_1.default {
    constructor(user) {
        super(user);
        this._run = () => __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://vip.jr.jd.com/');
            const statusEle = yield page.$('.m-qian');
            const statusText = yield page.evaluate(element => element.textContent, statusEle);
            if (statusText.indexOf('已签到') >= 0) {
                console.log(log_1.mute('已签到'));
            }
            else {
                yield page.click('.m-qian');
                yield page.waitFor(1000);
                yield page.waitFor('#getRewardText');
                const successText = yield page.evaluate(element => element.textContent, yield page.$('#getRewardText'));
                console.log(successText ? log_1.success(successText) : log_1.warning('未知签到状态'));
            }
            yield page.close();
        });
        this.name = '网页端京东金融每日签到';
    }
}
exports.default = JinrongDaily;
