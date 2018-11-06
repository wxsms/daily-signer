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
const path = require("path");
const md5_1 = require("../../../utils/md5");
const base64 = require("../../../utils/base64");
const browser_1 = require("../../../utils/browser");
function getCookiePathByUser(user) {
    return path.join(__dirname, '../../../../temp/', md5_1.default('cookies-jd-m' + user.username));
}
function login(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch({
            headless: false,
            defaultViewport: {
                width: 1024,
                height: 768
            }
        });
        const page = yield browser.newPage();
        yield page.goto('https://plogin.m.jd.com/user/login.action');
        user.username && (yield page.type('#username', user.username));
        user.password && (yield page.type('#password', user.password));
        // 等待用户登录成功，页面将跳转到 jd.com
        yield page.waitForFunction('window.location.href.indexOf("https://m.jd.com/") >= 0', { timeout: 0 });
        const cookies = yield page.cookies();
        fs.writeFileSync(getCookiePathByUser(user), base64.encode(JSON.stringify(cookies)));
        yield browser.close();
        console.log('登录成功！');
    });
}
exports.login = login;
function getSavedCookies(user) {
    const cookieStr = fs.readFileSync(getCookiePathByUser(user)).toString();
    return JSON.parse(base64.decode(cookieStr));
}
exports.getSavedCookies = getSavedCookies;
function checkCookieStillValid(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('检查 Cookies 是否有效...');
            const cookies = getSavedCookies(user);
            const browser = browser_1.getBrowser();
            const page = yield browser.newPage();
            // 此处不能忽略资源，否则会无限加载
            // await abortUselessRequests(page)
            yield page.setCookie(...cookies);
            yield page.goto('https://home.m.jd.com/myJd/newhome.action', { waitUntil: 'networkidle0' });
            const valid = (yield page.$('#userName')) !== null;
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
exports.checkCookieStillValid = checkCookieStillValid;
