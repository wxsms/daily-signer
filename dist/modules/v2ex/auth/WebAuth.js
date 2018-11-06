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
const path = require("path");
const puppeteer_1 = require("../../../utils/puppeteer");
const md5_1 = require("../../../utils/md5");
const Auth_1 = require("../../../interfaces/Auth");
class WebAuth extends Auth_1.default {
    constructor(user) {
        super(user);
    }
    getCookiePath() {
        return path.join(__dirname, '../../../../temp/', md5_1.default('cookies-v2ex' + this.user.username));
    }
    _login(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.goto('https://www.v2ex.com/signin');
            this.user.username && (yield page.type('.sl', this.user.username));
            this.user.password && (yield page.type('.sl[type="password"]', this.user.password));
            // 等待用户登录成功
            yield page.waitForFunction('window.location.href === "https://www.v2ex.com/"', { timeout: 0 });
        });
    }
    _check(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield puppeteer_1.abortUselessRequests(page);
            yield page.goto('https://www.v2ex.com/settings');
            return (yield page.$('form[action="/settings"]')) !== null;
        });
    }
}
exports.default = WebAuth;
