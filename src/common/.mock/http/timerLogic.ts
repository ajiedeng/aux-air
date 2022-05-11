import { TimerItem } from "./../../../panel/pages/timer/timerFactory/timerType";
import { Attribute } from "./../../http/index";
import { QueryTimerRes, UpsertTimerReq, UpsertTimerRes, DeleteTimerReq, DeleteTimerRes, BatchesUpdateReq, BatchesUpdateRes } from "./../../../panel/pages/timer/timerFactory/CRUDType";
import { queryReq } from "./data";
import { v4 as uuid } from "uuid";
export const queryMockTimer = (req) => {
    console.log('---queryMockTimer-', req)
    const store = window.localStorage.getItem('cloudTimer');
    if (store) {
        return store
    } else {
        window.localStorage.setItem('cloudTimer', JSON.stringify(queryReq));
        return queryReq
    }
}

export const upsertMockTimer: (req: UpsertTimerReq) => UpsertTimerRes = (req) => {
    console.log('---upsertMockTimer-', req);
    const store: QueryTimerRes = JSON.parse(window.localStorage.getItem('cloudTimer'));
    const timerlist = store.payload.timerlist;
    const todojobid = req.payload.jobid;
    if (todojobid) {//更新
        const findI = timerlist.findIndex(timer => timer.jobid === todojobid);
        findI >= 0 && (timerlist[findI] = req.payload);
    } else {//添加
        req.payload.jobid = uuid();
        timerlist.push(req.payload);
    }
    window.localStorage.setItem('cloudTimer', JSON.stringify(store));
    return { status: 0, msg: 'suc', payload: { jobid: req.payload.jobid } }
}

export const deleteMockTimer: (req: DeleteTimerReq) => DeleteTimerRes = (req) => {
    console.log('---deleteMockTimer-', req);
    const store: QueryTimerRes = JSON.parse(window.localStorage.getItem('cloudTimer'));
    const timerlist = store.payload.timerlist;
    const jobids = req.payload.jobids;
    const _list = timerlist.filter(timer => !jobids.includes(timer.jobid));
    store.payload.timerlist = _list;
    window.localStorage.setItem('cloudTimer', JSON.stringify(store));
    return { status: 0, msg: 'suc' }
}

export const batchesUpdateMockTimer: (req: BatchesUpdateReq) => BatchesUpdateRes = (req) => {
    console.log('---batchesUpdateMockTimer-', req);
    const store: QueryTimerRes = JSON.parse(window.localStorage.getItem('cloudTimer'));
    const timerlist = store.payload.timerlist;
    const timersMap = {} as { [jobid: string]: TimerItem };
    for (const timer of timerlist) {
        timersMap[timer.jobid] = timer;
    }
    const updateattributes = req.payload.updateattributes;
    for (const updater of updateattributes) {
        const jobid = updater.jobid;
        const attributes = updater.attributes;
        const attributesObj = {} as any;
        for (const attribute of attributes) {
            attributesObj[attribute.name] = attribute.value;
        }
        timersMap[jobid] = Object.assign(timersMap[jobid], attributesObj)
    }

    store.payload.timerlist = Object.values(timersMap);
    window.localStorage.setItem('cloudTimer', JSON.stringify(store));
    return { status: 0, msg: 'suc' }
}