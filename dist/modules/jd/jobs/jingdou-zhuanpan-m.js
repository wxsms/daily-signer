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
const MobileJob_1 = require("../interfaces/MobileJob");
function doWheel(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const btn = yield page.$('.wheel_pointer_wrap');
        yield btn.tap();
        const res = yield page.waitForResponse(res => res.url().startsWith('https://api.m.jd.com/client.action?functionId=babelGetLottery') && res.status() === 200);
        try {
            const resJson = JSON.parse((yield res.text()).replace(/^jsonp2\(/, '').replace(/\)$/, ''));
            console.log(log_1.success(resJson.promptMsg), log_1.success(resJson.prizeName));
        }
        catch (e) {
            console.log(log_1.error(e.message));
        }
    });
}
class JingdouZhuanpanMobile extends MobileJob_1.default {
    constructor(user) {
        super(user);
        this._run = () => __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://bean.m.jd.com/');
            const linkHandlers = yield page.$x('//span[contains(text(), \'转福利\')]//ancestor::div[@accessible]');
            if (linkHandlers.length > 0) {
                //console.log(await page.evaluate(element => element.textContent, linkHandlers[0]))
                yield linkHandlers[0].tap();
                yield page.waitForFunction('window.location.href.indexOf("https://pro.m.jd.com/mall/active/") >= 0');
                yield page.waitFor('.wheel_chance');
                yield page.waitForFunction('document.querySelector(".wheel_chance").textContent !== ""');
                const chanceTextFull = yield page.evaluate(element => element.textContent.replace(/[ \r\n]/g, ''), yield page.$('.wheel_chance_wrap'));
                const chanceText = yield page.evaluate(element => element.textContent, yield page.$('.wheel_chance'));
                if (chanceText === '0') {
                    // 已用完次数
                    console.log(log_1.mute(chanceTextFull));
                }
                else {
                    // 可以抽奖
                    console.log(log_1.success(chanceTextFull));
                    const chanceInt = parseInt(chanceText);
                    for (let i = 0; i < chanceInt; i++) {
                        yield doWheel(page);
                        yield page.reload({ waitUntil: 'networkidle0' });
                    }
                }
            }
            else {
                console.log(log_1.mute('未找到活动入口'));
            }
            //await page.waitFor(9999999, {timeout: 0})
            yield page.close();
        });
        this.name = '移动端京豆转福利';
    }
}
exports.default = JingdouZhuanpanMobile;
