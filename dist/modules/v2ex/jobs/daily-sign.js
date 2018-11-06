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
const auth = require("../auth/web");
const log_1 = require("../../../utils/log");
const puppeteer_1 = require("../../../utils/puppeteer");
const Job_1 = require("../../../interfaces/Job");
class DailySign extends Job_1.default {
    constructor(user) {
        super(user);
        this._run = () => __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://www.v2ex.com/mission/daily');
            const btn = yield page.$('input[type="button"].super.normal.button');
            const btnText = yield page.evaluate(element => element.getAttribute('value'), btn);
            // console.log(btnText)
            if (btn && btnText.indexOf('领取') >= 0) {
                yield Promise.all([
                    page.waitForNavigation(),
                    btn.click()
                ]);
                const bodyHTML = yield page.evaluate(() => document.body.innerHTML);
                const successMatch = bodyHTML.match(/已连续登录 \d+ 天/);
                console.log(log_1.success(successMatch[0]));
            }
            else {
                const bodyHTML = yield page.evaluate(() => document.body.innerHTML);
                const successMatch = bodyHTML.match(/已连续登录 \d+ 天/);
                console.log(log_1.mute(successMatch[0]));
            }
            yield page.close();
        });
        this.name = '每日签到';
        this.getCookies = auth.getSavedCookies;
    }
    run() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
exports.default = DailySign;
