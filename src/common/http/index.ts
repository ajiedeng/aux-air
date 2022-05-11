import { TimerItem } from "@panel/pages/timer/timerFactory/timerType";
import { post as _post, get as _get } from './fetch';
import jssdk from 'jssdk';
import { v4 as uuid } from 'uuid';
import store from '@common/store';
import { QueryTimerRes } from "@panel/pages/timer/timerFactory/CRUDType";
import toast from '@components/Toast'
import moment from 'moment';

const BASE_URL = '/appfront/v1/timertask/manage';
// const BASE_URL = '';

let app_host: string = '',
  reg = /(^\/(.)+)+/;
const getURL = async (api: string) => {
  if (!app_host) {
    app_host = (await jssdk.platformSDK.callNative('init') as any).app_host || "https://app-service-chn-31a93883.ibroadlink.com";
  }
  if (reg.test(api)) {
    return app_host + api;
  } else {
    throw new Error(`---api--should--started---with------${'/'}`);
  }
};

export const get = async (api: string) => {
  const url = await getURL(api);
  return _get(url);
};

export const post = async (api: string, data: Object, headers: Object = {}) => {
  const url = await getURL(api);
  return _post(url, data, headers);
};

export const cloudTimerApi = ({ body, headers = {}, messageId }: { body: Object, headers?: Object, messageId?: string }) => {
  const { global: { userId, loginSession, familyId } } = store.getState();
  return post(`${BASE_URL}`,
    {
      version: "v4",
      familyid: familyId,
      ...body
    },
    {
      userId,
      loginsession: loginSession,
      familyId,
      messageId: messageId || uuid(),
      ...headers
    }
  )
};

interface PageOpt { page?: number, pagesize?: number }
export const timerQuery = (pageOpt: PageOpt = { page: 0, pagesize: 10 }): Promise<QueryTimerRes> => {
  const { devState: { deviceID } } = store.getState();
  return cloudTimerApi({
    body: {
      command: "query",
      endpoints: [{
        endpointid: deviceID
      }],
      ...pageOpt
    }
  })
}

export const timerDelete = (...jobids: string[]) => {
  const { devState: { deviceID } } = store.getState();
  return cloudTimerApi({
    body: {
      command: "delete",
      endpoints: [{
        endpointid: deviceID
      }],
      payload: {
        jobids
      }
    }
  })
}

const preHandleOriginDataList = (datalist: [{ datakey: "turnon"; data: string; }, { datakey: "turnoff"; data: string; }]) => {
  const { global: { userId, familyId }, devState: { deviceID } } = store.getState();
  const messageId = uuid();
  const _datalist = datalist.map(({ datakey, data }) => {
    const _data = {
      directive: {
        header: {
          namespace: "DNA.KeyValueControl",
          name: "FreeKeyValueControl",
          interfaceVersion: "2",
          messageId
        },
        endpoint: {
          endpointId: deviceID,
          cookie: {
            did: deviceID,
            pid: (window as any)?.PROFILE?.desc?.pid,
            userId,
            familyId
          }
        },
        payload: {
          act: "set",
          ...JSON.parse(data)
        }
      }
    }
    return {
      datakey,
      data: JSON.stringify(_data)
    }
  })
  return {
    datalist: _datalist,
    messageId
  }
}

export type UpsertTimer = Omit<TimerItem, 'version' | 'familyid' | 'endpoindid' | 'userid' | 'reqtype' | 'donedeal'>;
const EVERYDAY = '1234567';
export const timerUpsert = (originTimer: UpsertTimer) => {
  const { global: { userId, familyId }, devState: { deviceID }, timer: { all } } = store.getState();
  const normalList = all.filter(timer => timer.extern === 'normal');
  // const normaEnlList = normalList.filter(timer => timer.enable && timer.jobid !== originTimer.jobid);
  const everydayList = normalList.filter(timer => timer.startTimer.repeat.join('') === EVERYDAY);
  const weekdayList = normalList.filter(timer => timer.startTimer.repeat.join('') !== EVERYDAY);
  const _weekdays = originTimer.timers[0].weekdays;
  if (_weekdays === EVERYDAY && everydayList.length >= 6 && originTimer.extern === 'normal' && (!originTimer.jobid || everydayList.findIndex(t => t.jobid === originTimer.jobid) < 0)) {
    store.dispatch({ type: 'timer/timerloading', payload: false })//冲突时loading隐藏
    return toast.info('everydayTimerTips')
  }
  if (_weekdays !== EVERYDAY && weekdayList.length === 6 && originTimer.extern === 'normal' && (!originTimer.jobid || weekdayList.findIndex(t => t.jobid === originTimer.jobid) < 0)) {
    store.dispatch({ type: 'timer/timerloading', payload: false })//冲突时loading隐藏
    return toast.info('weekdayTimerTips')
  }
  // const { timers: [{ time: stime, weekdays }, { time: etime }], enable } = originTimer;
  // if (enable && originTimer.extern === 'normal') {
  //   const startP = moment(stime).format('HH:mm');
  //   const endP = moment(etime).format('HH:mm');
  //   const originTimerWeekdays = weekdays.split('').map(str => Number(str));
  //   for (const normalTimer of normaEnlList) {
  //     const { startTimer, endTimer } = normalTimer;
  //     const twoTimePoint = [startTimer.moment.format('HH:mm'), endTimer.moment.format('HH:mm')];
  //     const isTimeUnite = twoTimePoint.includes(startP) || twoTimePoint.includes(endP);
  //     const noDum = new Set([...originTimerWeekdays, ...startTimer.repeat]);
  //     const isWeekdayUnite = (originTimerWeekdays.length + startTimer.repeat.length) > [...noDum].length
  //     if (isTimeUnite && isWeekdayUnite) {
  //       store.dispatch({ type: 'timer/timerloading', payload: false })//冲突时loading隐藏
  //       return toast.info('定时任务时间冲突，请修改时间');
  //     }
  //   }
  // }

  const { datalist, messageId } = preHandleOriginDataList(originTimer.datalist)
  return cloudTimerApi({
    body: {
      command: "upsert",
      familyid: undefined,
      payload: {
        ...originTimer,
        datalist,
        familyid: familyId,
        endpointid: deviceID,
        userid: userId,
        reqtype: "devControl",
        donedeal: "keep",
      }
    },
    messageId
  })
}

type Valueof<T> = T[keyof T];
export interface Attribute {
  name: keyof Pick<UpsertTimer, 'enable' | 'datalist' | 'invalidtimes' | 'validtimes' | 'timers'>,
  value: Valueof<Pick<UpsertTimer, 'enable' | 'datalist' | 'invalidtimes' | 'validtimes' | 'timers'>>
}
export interface BatchesItem {
  jobid: string,
  attributes: Attribute[]
}

export const timerBatchesUpdate = (batches: BatchesItem[]) => {
  return cloudTimerApi({
    body: {
      command: "updateattribute",
      familyid: undefined,
      payload: {
        updateattributes: batches
      }
    }
  })
}