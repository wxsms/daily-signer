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
const Job_1 = require("../../../interfaces/Job");
class JingDouDaily extends Job_1.default {
    constructor(user) {
        super(user);
        this._run = () => __awaiter(this, void 0, void 0, function* () {
            const page = yield this.browser.newPage();
            yield page.setCookie(...this.cookies);
            yield page.goto('https://ljd.m.jd.com/countersign/receiveAward.json');
            const res = JSON.parse(yield page.evaluate(element => element.textContent, yield page.$('pre')));
            const code = res.res.code;
            const awardData = res.res.data && res.res.data[0];
            if (code === '0') {
                if (awardData) {
                    console.log(log_1.success(`领到${awardData.awardName}${awardData.awardCount}个`));
                }
                else {
                    console.log(log_1.mute('颗粒无收'));
                }
            }
            else if (code === 'DS102') {
                console.log(log_1.mute('活动未开始'));
            }
            else if (code === 'DS103') {
                console.log(log_1.mute('活动已结束'));
            }
            else if (code === 'DS104') {
                console.log(log_1.mute('颗粒无收'));
            }
            else if (code === 'DS106') {
                console.log(log_1.mute('未完成双签'));
            }
            else {
                console.log(log_1.error('未知状态'), log_1.error(code));
            }
        });
        this.name = '移动端双签';
        this.getCookies = auth.getSavedCookies;
    }
    run() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("run").call(this);
        });
    }
}
exports.default = JingDouDaily;
