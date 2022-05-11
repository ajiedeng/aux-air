export type OnOFF = 'turnon' | 'turnoff';
export interface TimerContent<T extends OnOFF> {
    desc: string,
    weekdays: string,//'1234567'
    time: string,
    zoneinfo: "Asia/Shanghai",
    datakey: T
}

export type TimeArr = string[][];//string需要携带时区信息

export interface TimerRes {
    status: number,
    msg: string
}

export interface TimerItem {
    jobid: string,
    enable: boolean,
    timers: [TimerContent<'turnon'>, TimerContent<'turnoff'>],//定时任务开始任务/结束任务
    validtimes: TimeArr,//定时策略,针对上面的每个任务生效
    invalidtimes: TimeArr,
    donedeal: "keep",
    datalist: [{ datakey: "turnon", "data": string }, { datakey: "turnoff", "data": string }],
    familyid: string,
    endpoindid: string,
    userid: string,
    reqtype: 'devControl',
    extern: string
}