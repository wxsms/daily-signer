# 日常签到助手

![](https://img.shields.io/badge/node-%3E%3D8-brightgreen.svg)

## 使用方法

1. 下载代码
2. 添加配置，详见[配置说明](https://github.com/wxsms/daily-signer#配置说明)
3. 安装依赖：`npm install` or `yarn`
4. 运行：`npm start`

## 配置说明

修改 `config/user.json.template`，将其另存为 `config/user.json` 即可。支持设置多个账号。具体字段说明如下：

```js
{
  "jd": [
    {
      "username": "", // 登录用户名
      "skipLogin": false, // 当 cookie 过期时，是否允许重新登录
      "skip": false // 是否忽略此账号的任务
    }
  ]
}
```

## 支持任务

* 京东
    * 网页端每日签到
    * 移动端每日签到
    * 店铺每日签到
    * 京东金融每日签到
    * 双签

## 登录方式

1. 初次使用时，会调起浏览器窗口，输入密码以及验证码登录即可
2. 以后使用则会使用储存的 cookie直接登录，无需再次手动登录
3. 当 cookie 过期后，会重新进入 1 的流程

注：cookie 使用 base64 加密，储存在项目根目录下的 `temp` 文件夹中。
