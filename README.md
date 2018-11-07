# 日常签到助手

![](https://img.shields.io/badge/node-%3E%3D8-brightgreen.svg)

![截图](https://user-images.githubusercontent.com/5960988/47428265-50dd2700-d7c5-11e8-9847-0e7caae5108d.jpg)


## 支持任务

* 京东
    * 网页端每日签到
    * 网页端店铺每日签到
    * 网页端金融每日签到
    * 移动端每日签到
    * 移动端每日福利
    * 移动端京豆转福利
    * 移动端双签
    * 移动端金融赚钱签到
* V2EX
    * 每日签到

## 使用方法

1. 下载代码
2. 添加配置，详见[配置说明](https://github.com/wxsms/daily-signer#配置说明)
3. 安装依赖：`npm install --production` or `yarn install --production` (下载困难的可以使用 [cnpm](https://npm.taobao.org/))
4. 运行：`npm start`

## 配置说明

修改 `config/user.json.template`，将其另存为 `config/user.json` 即可。支持设置多个账号。具体字段说明如下：

```js
{
  "jd": [
    {
      "username": "", // 登录用户名
      "password": "", // 密码（非必填，如果设置了密码，在某些流程中可以自动登录）
      "skipLogin": false, // 当 cookie 过期时，是否允许重新登录
      "skip": false, // 是否忽略此账号的任务
      "skipJobs": [] // 忽略单个任务的列表，填写任务名，如"网页端每日签到"
    }
  ]
}
```

## 登录方式

1. 初次使用时:
   1. 如果该流程不支持自动登录，则会调起浏览器窗口，输入密码以及验证码登录即可
   2. 如果支持自动登录，以及在配置文件中填写了密码，则程序会尝试自动登录，无需额外操作
2. 以后使用则会使用储存的 cookie 作为身份凭据，无需再次登录
3. 当 cookie 过期后，会重新进入 1 的流程

注：

1. 京东网页端以及移动端的 cookie 无法共享使用，因此首次使用时需要分别登录
2. cookie 使用 base64 加密，储存在项目根目录下的 `temp` 文件夹中
