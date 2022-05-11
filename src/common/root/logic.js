import jssdk from 'jssdk';
import store from '@common/store';

const _logWithTime = (log, level = 'error') =>
  console[level](
    log + ',at (milliseconds) ' + (new Date().getTime() + '').substr(6)
  );

const currentState = {
  status: {},
  online: '2',
};

let controlling = false;
let updateCallback;

let delayWebsocketUpdateTimer = null;

const trimAndCompare = (newState, firstTime) => {
  let result;
  if (newState.online != null && newState.online !== currentState.online) {
    result = {};
    result.online = newState.online;
    currentState.online = newState.online;
  }

  if (newState.name != null && newState.name !== currentState.name) {
    result = result || {};
    result.name = newState.name;
    currentState.name = newState.name;
  }

  if (
    newState.deviceID != null &&
    newState.deviceID !== currentState.deviceID
  ) {
    //   保存设备id
    result = result || {};
    result.deviceID = newState.deviceID;
    currentState.deviceID = newState.deviceID;
  }

  let changedStatus;
  if (newState.status) {
    Object.keys(newState.status).forEach((p) => {
      const status = newState.status;

      if (
        /*filter(p) &&*/
        status[p] != null &&
        status[p] !== currentState.status[p]
      ) {
        changedStatus = changedStatus || {};
        changedStatus[p] = status[p];
      }
    });
  }

  if (changedStatus) {
    currentState.status = {
      ...currentState.status,
      ...changedStatus
    };

    result = result || {};
    result.status = changedStatus;
  }

  if (result) {
    updateCallback(result, firstTime);
  }

  if (result) {
    _logWithTime(`trim&compare : ${JSON.stringify(result)}`);
  }
  return result;
};

const getStatus = function () {
  return jssdk.getDeviceStatus().then((data) => {
    if (!controlling) {
      trimAndCompare(data);
    }
  });
};

const getStatusWithParam = function () {
  return jssdk.getDeviceStatus(['hp_water_tank_temp']).then((data) => {
    if (!controlling) {
      trimAndCompare(data);
    }
  });
};

let loopIntervalID;
const startLoop = (interval = 20000) => {
  if (loopIntervalID) {
    console.error('轮询已经启动,本次操作忽略');
    return;
  };
  getStatus();
  getStatusWithParam();
  loopIntervalID = setInterval(() => {
    getStatusWithParam();
  }, interval);
};

const stopLoop = () => {
  if (loopIntervalID) {
    clearInterval(loopIntervalID);
    loopIntervalID = null;
  }
};

const getState = () => currentState;

const ready = (updater, interval) => {
  updateCallback = updater;
  return jssdk
    .ready()
    .then((data) => {
      trimAndCompare(data, true);
    })
    .finally(() => startLoop(interval));
};

const defaultOpts = {
  /*
   * Function | false
   * Function : 打开和关闭loading界面的方法，根据传入的参数判断（true/false）
   * false ： 无需显示loading界面
   * */
  loading: null,
  /* 控制完成后重启轮询的等待时间(ms)*/
  restartLoopTimeout: 10000,
  /*
    延迟发送命令的时间（小于延时的操作，会被合并，类似debounce），如果为0或者false则不延时以及合并。
     * */
  execDelayTimeout: false,
  /*
   * 是否解析控制接口的返回值，个别平台的控制接口的返回值（即设备状态，不一定得到了更新）
   * false: 根据返回值更新内存中设备状态
   * true: 忽略返回值
   * */
  ignoreResponse: false,
  /*
   * 'immediate'|'success'|'loop'
   * 内存中设备状态的更新逻辑
   * 'immediate'：control被调用后立刻更新
   * 'success'：在控制接口的success callback 中更新
   * 'loop'：不更新（只依靠轮询）
   * */
  updateStrategy: 'success',
  /*
    retry为一个对象{
    errorCode: 输出数组或者单个错误码
    retryCount: 遇到errorCode时，最大重试的次数
    }
    如，遇到网络超时（-4000），则最大重试3次：{
    errorCode: -4000
    retryCount: 3
    }
     * */
  retry: undefined,
  /*
   * Function | false
   * 默认的出错处理逻辑
   * Function ：默认的出错callback，会传入一个Error对象。如统一的toast提示
   * false ： 不做任何处理
   * */
  onFail: null,
  /*
   * Function | false
   * 默认的成功处理逻辑
   * Function ：默认的成功callback，会传入实际发送下去的控制命令对象
   * false ： 不做任何处理
   * */
  onSuccess: false,
  /*
   * true | false
   * 控制是否需要放入队列中进行排队
   * */
  queue: true,
};

const control = (function () {
  let restartLoopTimeoutID;

  let uuid;
  const retryControl = async function (
    cmd, {
      retryCount = 0,
      errorCode = null,
      timeout = 0
    } = {}
  ) {
    _logWithTime(`control : ${JSON.stringify(cmd)}`);

    //为每一次执行分配UUID，保证如果有多个control在同时执行(虽然底层有消息队列的保证，其实是顺序实行的。但因为中间没有时间间隔，如无loading的情况，界面会发生抖动)，
    // 只会采用最后一次返回的结果，去更新内存中的值
    uuid = Date.now();
    return (async function (execId) {
      let error;
      for (let i = 0; i < retryCount + 1; i++) {
        try {
          const data = await jssdk.setDeviceStatus(cmd);
          if (uuid !== execId) {
            console.warn('ignore this updates,because its not final');
          }
          return uuid === execId ? data : null;
        } catch (err) {
          error = err;
          if (
            i < retryCount &&
            (Array.isArray(errorCode) ?
              errorCode.indexOf(err.code) > -1 ||
              errorCode.indexOf(err.code + '') > -1 :
              errorCode + '' === err.code + '')
          ) {
            console.error(
              `控制出错，${timeout}秒后重试，错误信息：${err.message}`
            );
            await new Promise((resolve) => setTimeout(resolve, timeout));
          }
        }
      }
      // 重试 N 次后失败
      throw error;
    })(uuid);
  };

  const cachedControl = (function () {
    let delayExecTimeoutId;
    let cmdCache = {};

    return function (cmd, delay, retry) {
      clearTimeout(delayExecTimeoutId);
      //update cache
      cmdCache = {
        ...cmdCache,
        ...cmd
      };

      return new Promise((resolve, reject) => {
        delayExecTimeoutId = setTimeout(() => {
          retryControl(cmdCache, retry).then(resolve, reject);
          cmdCache = {};
        }, delay);
      });
    };
  })();

  return async function (cmd, opt) {
    const {
      loading,
      execDelayTimeout,
      ignoreResponse,
      retry,
      updateStrategy,
      onFail,
      onSuccess,
      restartLoopTimeout,
    } = {
      ...defaultOpts,
      ...opt
    };

    //设置标志位
    controlling = true;
    if(delayWebsocketUpdateTimer){
      clearTimeout(delayWebsocketUpdateTimer)
    }
    store.dispatch({ type: 'global/controllingUpdate', payload: true });
    //停止当前轮询
    stopLoop();
    //停止上一次的重启轮询计划
    clearTimeout(restartLoopTimeoutID);

    if (loading) {
      loading(true);
    }

    if (updateStrategy === 'immediate') {
      trimAndCompare({
        status: cmd
      });
    }

    //延时重启轮询
    //在此而不是在控制之后重启的原因是，cachedControl/retryControl都是异步操作
    //所以有可能会被启动多次，而且无法被clear
    restartLoopTimeoutID = setTimeout(() => startLoop(), restartLoopTimeout);

    try {
      let result;
      if (execDelayTimeout) {
        //采用在DelayTimeout期限内合并命令的逻辑
        result = await cachedControl(cmd, execDelayTimeout, retry);
      } else {
        result = await retryControl(cmd, retry);
      }
      if (!ignoreResponse && result) {
        trimAndCompare(result);
      }
      if (updateStrategy === 'success') {
        trimAndCompare({
          status: cmd
        });
      }
      onSuccess && onSuccess(result);
      return result;
    } catch (e) {
      console.error(e.message);
      getStatus();

      if (!(onFail && onFail(e))) {
        throw e;
      }
    } finally {
      if (loading) {
        loading(false);
      }
      controlling = false;
      delayWebsocketUpdateTimer = setTimeout(()=>{
        store.dispatch({ type: 'global/controllingUpdate', payload: false });
      },3000)
    }
  };
})();

const updateDefaultControlOpts = (opts) => Object.assign(defaultOpts, opts);

export {
  ready,
  getState,
  startLoop,
  stopLoop,
  control,
  updateDefaultControlOpts,
};