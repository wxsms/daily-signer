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
class JingdouShops extends Job_1.default {
    constructor(user) {
        super(user);
        this._run = () => __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://bean.jd.com/myJingBean/list');
            yield page.waitFor('.bean-shop-list');
            const list = yield page.$$('.bean-shop-list > li');
            for (let i = 0; i < list.length; i++) {
                const link = yield list[i].$('.s-name > a');
                const linkText = yield page.evaluate(element => element.textContent, link);
                try {
                    const href = yield page.evaluate(element => element.getAttribute('href'), link);
                    //console.log(linkText, href)
                    const shopPage = yield this.browser.newPage();
                    yield puppeteer_1.abortUselessRequests(shopPage);
                    yield shopPage.setCookie(...this.cookies);
                    yield shopPage.goto(href);
                    yield shopPage.waitFor('.jSign');
                    const unsignedLink = yield shopPage.$('.unsigned');
                    if (unsignedLink) {
                        const unsignedHref = yield shopPage.evaluate(element => element.getAttribute('url'), unsignedLink);
                        //console.log(unsignedHref)
                        yield shopPage.goto('https://' + unsignedHref);
                        const jingdou = yield shopPage.$('.jingdou');
                        if (jingdou) {
                            const successText = yield shopPage.evaluate(element => element.textContent, jingdou);
                            console.log(linkText, log_1.success(successText));
                        }
                        else {
                            console.log(linkText, '颗粒无收');
                        }
                    }
                    else {
                        console.log(linkText, log_1.mute('已签到'));
                    }
                    yield shopPage.close();
                }
                catch (e) {
                    console.log(linkText, log_1.error('任务失败'), log_1.error(e.message));
                }
            }
            yield page.close();
        });
        this.name = '网页端店铺每日签到';
        this.getCookies = auth.getSavedCookies;
    }
    run() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
exports.default = JingdouShops;
