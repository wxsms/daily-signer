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
const canvas_1 = require("canvas");
const puppeteer_1 = require("../../../utils/puppeteer");
const md5_1 = require("../../../utils/md5");
const canvas_2 = require("../../../utils/canvas");
const Auth_1 = require("../../../interfaces/Auth");
function getVerifyPosition(base64, actualWidth) {
    return new Promise((resolve, reject) => {
        const canvas = canvas_1.createCanvas(1000, 1000);
        const ctx = canvas.getContext('2d');
        const img = new canvas_1.Image();
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            const maskRgba = [0, 0, 0, 0.65];
            const t = 10; // 色差容忍值
            let prevPixelRgba = null;
            for (let x = 0; x < width; x++) {
                // 重新开始一列，清除上个像素的色值
                prevPixelRgba = null;
                for (let y = 0; y < height; y++) {
                    const rgba = ctx.getImageData(x, y, 1, 1).data;
                    if (prevPixelRgba) {
                        // 所有原图中的 alpha 通道值都是1
                        prevPixelRgba[3] = 1;
                        const maskedPrevPixel = canvas_2.combineRgba(prevPixelRgba, maskRgba);
                        // 只要找到了一个色值匹配的像素点则直接返回，因为是自上而下，自左往右的查找，第一个像素点已经满足"最近"的条件
                        if (canvas_2.tolerance(maskedPrevPixel, rgba, t)) {
                            resolve(x * actualWidth / width);
                            return;
                        }
                    }
                    else {
                        prevPixelRgba = rgba;
                    }
                }
            }
            // 没有找到任何符合条件的像素点
            resolve(0);
        };
        img.onerror = reject;
        img.src = base64;
    });
}
class WebAuth extends Auth_1.default {
    constructor(user) {
        super(user);
        this.canAutoLogin = Boolean(user.password && user.username);
    }
    getCookiePath() {
        return path.join(__dirname, '../../../../temp/', md5_1.default('cookies-jd' + this.user.username));
    }
    _login(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.goto('https://passport.jd.com/new/login.aspx');
            // 切换到用户名、密码登录tab
            yield page.click('.login-tab.login-tab-r > a');
            // 自动填写表单
            this.user.username && (yield page.$eval('#loginname', (el, value) => el.value = value, this.user.username));
            this.user.password && (yield page.$eval('#nloginpwd', (el, value) => el.value = value, this.user.password));
            if (this.canAutoLogin) {
                yield page.click('#loginsubmit');
                yield page.waitFor(1000);
                // 需要验证码
                let tryTimes = 0;
                // 最多尝试20次
                while (++tryTimes < 20 && (yield page.$('.JDJRV-bigimg'))) {
                    console.log(`正在尝试通过验证码（第${tryTimes}次）`);
                    // 验证码图片（带缺口）
                    const img = yield page.$('.JDJRV-bigimg > img');
                    // 获取缺口左x坐标
                    const distance = yield getVerifyPosition(yield page.evaluate(element => element.getAttribute('src'), img), yield page.evaluate(element => parseInt(window.getComputedStyle(element).width), img));
                    /*
                    // debug 用：在页面上展示找到的位置
                    await page.evaluate(distance => {
                      var mark = document.createElement('div')
                      mark.style.height = '10px'
                      mark.style.width = '10px'
                      mark.style.position = 'absolute'
                      mark.style.left = distance + 'px'
                      mark.style.top = '0px'
                      mark.style.backgroundColor = 'green'
                      document.querySelector('.JDJRV-bigimg').appendChild(mark)
                    }, distance)
                    await page.waitFor(2000)
                    */
                    // 滑块
                    const dragBtn = yield page.$('.JDJRV-slide-btn');
                    const dragBtnPosition = yield page.evaluate(element => {
                        // 此处有 bug，无法直接返回 getBoundingClientRect()
                        const { x, y, width, height } = element.getBoundingClientRect();
                        return { x, y, width, height };
                    }, dragBtn);
                    // 按下位置设置在滑块中心
                    const x = dragBtnPosition.x + dragBtnPosition.width / 2;
                    const y = dragBtnPosition.y + dragBtnPosition.height / 2;
                    if (distance > 10) {
                        // 如果距离够长，则将距离设置为二段（模拟人工操作）
                        const distance1 = Number(distance) - 10;
                        const distance2 = 10;
                        yield page.mouse.move(x, y);
                        yield page.mouse.down();
                        // 第一次滑动
                        yield page.mouse.move(x + distance1, y, { steps: 30 });
                        yield page.waitFor(500);
                        // 第二次滑动
                        yield page.mouse.move(x + distance1 + distance2, y, { steps: 20 });
                        yield page.waitFor(500);
                        yield page.mouse.up();
                    }
                    else {
                        // 否则直接滑到相应位置
                        yield page.mouse.move(x, y);
                        yield page.mouse.down();
                        yield page.mouse.move(x + distance, y, { steps: 30 });
                        yield page.mouse.up();
                    }
                    // 等待验证结果
                    yield page.waitFor(3000);
                }
            }
            // 等待用户登录成功，页面将跳转到 jd.com
            yield page.waitForFunction('window.location.href.indexOf("https://www.jd.com") >= 0', { timeout: 0 });
        });
    }
    _check(page) {
        return __awaiter(this, void 0, void 0, function* () {
            yield puppeteer_1.abortUselessRequests(page);
            yield page.goto('https://order.jd.com/center/list.action');
            return (yield page.$('body[myjd="_MYJD_ordercenter"]')) !== null;
        });
    }
}
exports.default = WebAuth;
