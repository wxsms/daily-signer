import { success, mute, error, warn } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/MobileJob'

export default class FuliDailyMobile extends Job {
  constructor (user) {
    super(user)
    this.name = '移动端每日福利'
  }

  protected async _run () {
    const homepage = 'https://wqs.jd.com/promote/201712/mwelfare/m.html?logintag=#/main'
    const beanBefore = await this.getCurrentBeanCount()
    const page = await this.browser.newPage()
    await Job.emulatePhone(page)
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto(homepage, {waitUntil: 'networkidle0'})
    // 签到
    console.log('执行签到...')
    const signBtn = await page.$('.signDay_day_item.day_able')
    if (signBtn) {
      await signBtn.click()
      const res = await page.waitForResponse(res => res.url().startsWith('https://s.m.jd.com/activemcenter/muserwelfare/sign'))
      try {
        const signData = JSON.parse((await res.text()).replace(/^try{.+?\(/, '').replace(/\);.+$/, ''))
        if (signData.ret == 0 && signData.level > 0) {
          console.log(success(`签到成功`))
        } else if (signData.ret == 10) {
          console.log(warn('网络异常，请重试'))
        } else if (signData.ret == 11) {
          console.log(mute('您已经签到过啦'))
        } else if ([15, 5, 6, 7, 11, 19].indexOf(signData.ret * 1) >= 0) {
          console.log(warn('该小时奖品已发放完，请下个时段再过来哦'))
        } else if ([3, 4, 10, 25, 21, 22].indexOf(signData.ret * 1) >= 0) {
          console.log(warn('奖品已发完，下次请早点来哦'))
        } else {
          console.log(error(`签到失败：${signData.ret}`))
        }
      } catch (e) {
        console.log(error(e.message))
      }
    } else {
      console.log(mute('今日已签到'))
    }
    // 每日任务
    let tryTimes = 0
    // 当页面上的任务按钮数为0，或尝试次数>5时结束
    while ((await page.$$('.welfareTask_btn')).length > 0 && ++tryTimes < 5) {
      // 找到所有任务按钮
      const taskBtns = await page.$$('.welfareTask_btn')
      for (let i = 0; i < taskBtns.length; i++) {
        const btn = taskBtns[i]
        const text = await page.evaluate(el => el.textContent, btn)
        if (text === '立即前往') {
          // 打开新页面执行任务
          const taskPage = await this.browser.newPage()
          await Job.emulatePhone(taskPage)
          await abortUselessRequests(taskPage)
          await taskPage.setCookie(...this.cookies)
          await taskPage.goto(homepage, {waitUntil: 'networkidle0'})
          // 新页面上的任务按钮
          const taskBtns = await taskPage.$$('.welfareTask_btn')
          const taskAwards = await taskPage.$$('.welfareTask_info > p:first-child')
          for (let i = 0; i < taskBtns.length; i++) {
            const btn = taskBtns[i]
            const award = taskAwards[i]
            const text = await taskPage.evaluate(el => el.textContent, btn)
            const textAward = await taskPage.evaluate(el => el.textContent, award)
            // 只要找到任何一个任务按钮，则点击（实际上应该是外层的同个按钮）
            if (text === '立即前往' && textAward.indexOf('京豆') >= 0) {
              console.log('执行每日福利任务...')
              await Promise.all([
                taskPage.waitForNavigation({waitUntil: 'networkidle0'}),
                btn.click()
              ])
              await taskPage.close()
              break
            }
          }
        } else if (text === '点击领取') {
          await btn.click()
        }
      }
      await page.reload({waitUntil: 'networkidle0'})
    }

    const beanAfter = await this.getCurrentBeanCount()
    if (beanAfter - beanBefore > 0) {
      console.log(success(`共获得${beanAfter - beanBefore}京豆`))
    }
    await page.close()
  }
}

/**
 * ref1
 */
// URL
// https://s.m.jd.com/activemcenter/muserwelfare/sign
// RES
// try{ jsonpCBKF({"active":"Myonghufliqiandao3","batchid":"","couponid":"","level":0,"ret":15,"retmsg":"no prize"} );}catch(e){}
// CODE
/*
signFn: function(item) {
  var self = this;
  if (item.canDraw) {
    if (self.randomisk) {
      return showCommonDia("活动太火爆了，请稍后再试！");
    } else {
      if (self.btnClass == "day_bl") {
        if (self.myinfo && self.myinfo.beanNum && self.myinfo.beanNum * 1 < 10) {
          return showCommonDia("您的京豆数量不足，无法完成补签哦~");
        }
      }
    }
    sign(item.day, item.activeId, item.activeLevel, function(signData) {
      if (signData.ret == 2) {
        login.login({
          rurl: JD.url.addUrlParam(location.href, {
            logintag: 'sign'
          })
        });
      } else if (signData.ret == 0 && signData.level > 0) {
        var eventParam = (signData.batchid || "0") + "_" + 1 + "_" + (signData.couponid || "0");
        if (item.day == 7) {
          item.canDraw = false;
          item.bagClass = "bag_unable";
          item.bagHtml = '<p>已领取</p><p>点击查看大礼包</p>';
          Vue.set(self.signList, item.day - 1, item);
          self.diaTitle = "恭喜您，获得专享大礼包";
          self.diaDesc = "已放入您的账户";
          self.isShowCouponBag = true;
          mClickReport("MWelfare_SignGetGift", eventParam);
        } else {
          if (item.btnText == "10京豆补签") {
            ui.info({
              msg: "补签成功，每周仅有2次补签机会哦"
            });
            mClickReport("MWelfare_SignSupply", eventParam);
          } else {
            ui.info({
              msg: "签到成功~"
            });
            mClickReport("MWelfare_SignGet", eventParam);
          }
          item.canDraw = false;
          item.btnText = "已签到领取";
          item.btnClass = "day_none";
          Vue.set(self.signList, item.day - 1, item);
        }
        if (item.Type == 4) {
          self.$emit("beanchange");
        }
      } else if (signData.ret == 3) {
        showCommonDia("您参与环境不对，请在浏览器中参与活动~")
      } else if (signData.ret == 10) {
        showCommonDia("网络异常，请刷新页面重试~", "刷新页面", function() {
          location.reload(true);
        })
      } else if (signData.ret == 11) {
        showCommonDia("您已经签到过啦~")
      } else if (signData.ret == 12) {
        showCommonDia("您没有连续签到，不能领券大礼包哦~")
      } else if (signData.ret == 13) {
        showCommonDia("签到失败，您已经补签过两次啦！")
      } else if (signData.ret == 14) {
        showCommonDia("京豆不足，无法补签哦~")
      } else if ([15, 5, 6, 7, 11, 19].indexOf(signData.ret * 1) >= 0) {
        showCommonDia("该小时奖品已发放完，请下个时段再过来哦~")
      } else if ([3, 4, 10, 25, 21, 22].indexOf(signData.ret * 1) >= 0) {
        showCommonDia("奖品已发完，下次请早点来哦~")
      } else {
        showCommonDia("活动太火爆了，请稍后再试~");
      }
    })
  } else if (item.day == 7) {
    if (item.level > 0) {
      self.diaTitle = "您已领取专享大礼包";
      self.diaDesc = "已放入您的账户";
    } else {
      self.diaTitle = "连续签到专享大礼包";
      self.diaDesc = "超值福利，等你来领";
    }
    self.isShowCouponBag = true;
    mClickReport("MWelfare_SignCheckGift");
  }
},*/

/**
 * ref2
 */
// URL https://s.m.jd.com/activemcenter/muserwelfare/draw
// RES try{ jsonpCBKF({"active":"mrenwu26","prize":[{"batchid":"","couponid":"","level":52}],"ret":0,"retmsg":"领取成功"} );}catch(e){}
