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
const puppeteer = require("puppeteer");
const fs = require("fs");
const base64 = require("../utils/base64");
const browser_1 = require("../utils/browser");
class Auth {
    constructor(user) {
        this.user = user;
        this.canAutoLogin = false;
    }
    getSavedCookies() {
        const cookieStr = fs.readFileSync(this.getCookiePath()).toString();
        return JSON.parse(base64.decode(cookieStr));
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer.launch({
                headless: this.canAutoLogin,
                defaultViewport: {
                    width: 1024,
                    height: 768
                }
            });
            const page = yield browser.newPage();
            yield this._login(page);
            const cookies = yield page.cookies();
            fs.writeFileSync(this.getCookiePath(), base64.encode(JSON.stringify(cookies)));
            yield browser.close();
            console.log('登录成功！');
        });
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('检查 Cookies 是否有效...');
                const cookies = this.getSavedCookies();
                const browser = browser_1.getBrowser();
                const page = yield browser.newPage();
                yield page.setCookie(...cookies);
                const valid = yield this._check(page);
                if (valid) {
                    console.log('Cookies 有效，直接登录');
                }
                else {
                    console.log('Cookies 已失效，请重新登录');
                }
                yield page.close();
                return valid;
            }
            catch (e) {
                console.log('Cookies 未找到，请重新登录');
                return false;
            }
        });
    }
}
exports.default = Auth;
