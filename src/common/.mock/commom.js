/*
 * @Author: your name
 * @Date: 2022-01-14 11:26:22
 * @LastEditTime: 2022-02-10 15:08:46
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \pet-feeder\src\common\.mock\commom.js
 */
let currentState = (function () {
  /* eslint-disable */
  const intfs = PROFILE.suids && PROFILE.suids[0] && PROFILE.suids[0].intfs;
  /* eslint-enable */
  if (!intfs) {
    throw new Error('profile error!');
  }
  const status = {};
  Object.keys(intfs).forEach(function (p) {
    const descriptor = intfs[p][0];
    // 1 表示枚举型
    // 2 表示连续型
    // 3 表示简单类型
    const type = descriptor.in[0];

    if (type === 1) {
      //[1, V1,V2,V3]
      // {"act": 3,"idx": 1,"ifttt": 0,"in": [1,0,1]}
      status[p] = descriptor.in[0];
    } else if (type === 2) {
      //[2, 最小值，最大值，步长，倍数]
      // { "act": 1,"idx": 1,"ifttt": 0, "in": [ 2,0,255,1,1] }
      status[p] = descriptor.in[1];
    } else if (type === 3) {
      status[p] = null;
    } else {
      console.log(`unsupported param type ${p} :${type}`);
    }
  });

  return {
    status,
    online: '1',
    name: '热泵空调',
    deviceID: '00000000000000000000c8f742fee1f8',
  };
})();

let _statusChangedCallback;

const ready = function () {
  return Promise.resolve(currentState);
};

const setDeviceStatus = function (status) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (Math.random() > 0.1) {
        currentState.status = Object.assign({}, currentState.status, status);
        if (_statusChangedCallback) {
          _statusChangedCallback(currentState);
        }
        resolve(currentState);
      } else {
        let err = new Error('this is a fake error');
        err.code = 1;
        reject(err);
      }
    }, 1000);
  });
};

const getDeviceStatus = function () {
  return Promise.resolve(currentState);
};

const onStatusChanged = function (fn) {
  _statusChangedCallback = fn;
};

export default new Proxy(
  {
    // platform:'mock',
    ready,
    setDeviceStatus,
    getDeviceStatus,
    onStatusChanged,
  },
  {
    get: function (target, key, receiver) {
      return target[key] || receiver;
    },
  }
);
