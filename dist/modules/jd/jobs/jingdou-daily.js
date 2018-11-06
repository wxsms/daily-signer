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
class JingdouDaily extends WebJob_1.default {
    constructor(user) {
        super(user);
        this.name = '网页端每日签到';
    }
    _run() {
        return __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield puppeteer_1.abortUselessRequests(page);
            yield page.setCookie(...this.cookies);
            yield page.goto('https://vip.jd.com/sign/index');
            const result = yield page.$('.day-info.active > .active-info > .title');
            const successText = yield page.evaluate(element => element.textContent, result);
            if (successText.indexOf('获得') >= 0) {
                console.log(log_1.success(successText));
            }
            else {
                console.log(log_1.mute(successText));
            }
            yield page.close();
        });
    }
}
exports.default = JingdouDaily;
