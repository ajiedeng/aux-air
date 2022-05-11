import { TimerItem, TimerRes } from "./timerType";

export interface UpsertTimerReq {
    version: 'v4',
    command: 'upsert',
    payload: TimerItem
}

export interface UpsertTimerRes extends TimerRes {
    payload: {
        "jobid": string//任务id
    }
}

export interface DeleteTimerReq {
    version: "v4",
    command: "delete",
    endpoints: [{
        endpointid: "xxxx"//did
    }], //指定多个endpointid
    familyid: "xxxx",//必填,指定家庭id
    payload: {
        jobids: string[]
    }
}

export type DeleteTimerRes = TimerRes;

export interface QueryReq {
    version: "v4",
    command: "query",
    endpoints: [{
        endpointid: string//did
    }], //指定多个endpointid
    familyid: string,//必填,指定家庭id
    page: number,
    pagesize: number//分页大小
}

export interface QueryTimerRes extends TimerRes {
    payload: {
        timerlist: TimerItem[]
    }
}

interface UpdateAttr {
    jobid: string,
    attributes: {
        name: string,
        value: boolean | string | [string, string][]
    }[]
}

export interface BatchesUpdateReq {
    version: "v4",
    command: "updateattribute",
    payload: {
        updateattributes: UpdateAttr[]
    }
}

export type BatchesUpdateRes = TimerRes
