import adapter from './dna';
import taskQueue from './task-queue.js';
const platform = adapter.platform;
const _setDeviceStatus = function (status) {
    return adapter.setDeviceStatus(status).then(function (data) {
        if (data && data.status) {
            return data;
        }
    });
};
const _getDeviceStatus = function (params) {
    return adapter.getDeviceStatus(params).then(function (data) {
        return data;
    });
};
const ready = function (readyType = 'device') {
    return adapter.ready(readyType).then(function (data) {
        return data;
    });
};
const _sync = function (fn, type, omit = false) {
    return function (...args) {
        return new Promise(function (resolve, reject) {
            const task = () => fn.apply(null, args)
                .then(resolve)
                .catch(reject);
            task.type = type;
            task.omit = omit;
            taskQueue.push(task);
        });
    };
};
const platformSDK = adapter.platformSDK;
if (platform === 'dna') {
    const { taskV2 } = platformSDK;
    taskV2.add = _sync(taskV2.add, 'timer');
    taskV2.list = _sync(taskV2.list, 'timer');
    taskV2.del = _sync(taskV2.del, 'timer');
    taskV2.sunSetting = _sync(taskV2.sunSetting, 'timer');
    taskV2.getLimitation = _sync(taskV2.getLimitation, 'timer');
    taskV2.call = _sync(taskV2.call, 'timer');
}
const jssdk = {
    ready,
    platformSDK,
    setDeviceStatus: _sync(_setDeviceStatus, 'set'),
    getDeviceStatus: _sync(_getDeviceStatus, 'get'),
    platform
};
export default jssdk;
