const queue = [];
let processing = false;
const timeoutPromise = function (promise, timeoutMillis) {
    let error = new Error('Promise Timeout'), timeout;
    return Promise.race([
        promise,
        new Promise(function (resolve, reject) {
            timeout = setTimeout(function () {
                reject(error);
            }, timeoutMillis);
        }),
    ]).then(function (v) {
        clearTimeout(timeout);
        return v;
    }, function (err) {
        clearTimeout(timeout);
        throw err;
    });
};
const startProcess = function () {
    processing = true;
    let task = queue.shift();
    if (task) {
        timeoutPromise(task(), 10000).then(function () {
            startProcess();
        }).catch(function (e) {
            startProcess();
            console.error(e.message);
        });
    }
    else {
        processing = false;
        // console.error('no more task')
    }
};
const push = function (task) {
    if (queue.length &&
        task.type === 'get' &&
        queue[queue.length - 1].type === task.type &&
        task.omit &&
        queue[queue.length - 1].omit === task.omit) {
        console.error(' A \'get\' task is running or to be running,current task is ignored');
        return;
    }
    if (queue.length &&
        task.type !== 'get' &&
        queue[queue.length - 1].type === 'get' &&
        queue[queue.length - 1].omit) {
        queue.splice(queue.length - 1, 0, task);
    }
    else {
        queue.push(task);
    }
    if (!processing) {
        startProcess();
    }
};
const taskQueue = {
    push
};
export default taskQueue;
