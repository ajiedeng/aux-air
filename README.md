# 奥克斯热泵

奥克斯独立APP

## UI

[UI figma地址](https://www.figma.com/file/CeewQ9eQSkCbBmFBRPkOdD/AC-Freedom-%E7%83%AD%E6%B3%B5?node-id=204%3A2)

参数表见doc文件夹

## 脚手架环境介绍

1. 在原先scaffolding项目基础上升级增加支持typescript开发配置，redux状态管理库引入了Redux Toolkit库处理状态管理，其次新增加开发的组件代码均采用了HOOKS方式编写。老的脚手架上的通用class组件大都保留原class的开发方式。
2. 定时采取云端定时的方案，定时相关的逻辑在panel=> pages=> timer文件目录下面,封装了TimerTwins类辅助解析与转换双定时组信息。定时接口文档见[这里](http://docs.ibroadlink.com/appservice/timersys/#7-v4%E5%AE%9A%E6%97%B6)，定时相关接口封装在common =>http文件下

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).



### roundSlider

https://roundsliderui.com/demos.html
https://www.jb51.net/article/113479.htm

https://www.cnblogs.com/pangys/p/13201808.html


APP 账号密码：guangyuan.tai@broadlink.com.cn /t123456