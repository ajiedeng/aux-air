import { QueryTimerRes } from "./../../../panel/pages/timer/timerFactory/CRUDType";
export const queryReq: QueryTimerRes = {
    "status": 0,
    "msg": "success",
    "payload": {
        "timerlist": [
            // {
            //     "jobid": "1",
            //     "enable": true,//必须//任务开关
            //     "timerlist": [{ //定时任务开始时间
            //         "desc": "",
            //         "weekdays": "1",
            //         "time": "2021-09-08T12:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnon"
            //     },
            //     { //定时任务开始时间
            //         "desc": "",//app使用
            //         "weekdays": "1",
            //         "time": "2021-09-08T23:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnoff"
            //     }],
            //     //定时策略,针对上面的每个任务生效
            //     "validtimes": [["2021-09-08T11:13:00+08:00", "2021-09-10T11:13:00+08:00"]], //必须有开始时间和结束时间,否则无效.如果未带时区且zoneinfo无时区信息,则无效
            //     "invalidtimes": [["2021-10-08T11:13:00+08:00", "2021-10-10T11:13:00+08:00"]],
            //     "donedeal": "keep",//keep表示任务完成时保留,其它值时任务完成时会被删除
            //     "datalist": [
            //         { "datakey": "turnon", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 1 }]] }) },
            //         { "datakey": "turnoff", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 0 }]] }) }
            //     ],
            //     "familyid": "xxxx",  //任务家庭id
            //     "endpoindid": "xxxx",//任务设备id
            //     "userid": "xxxx",
            //     "reqtype": "devControl",
            //     "extend": "eco"//预留字段
            // },
            // {
            //     "jobid": "2",
            //     "enable": true,//必须//任务开关
            //     "timerlist": [{ //定时任务开始时间
            //         "desc": "",
            //         "weekdays": "1",
            //         "time": "2021-09-08T12:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnon"
            //     },
            //     { //定时任务开始时间
            //         "desc": "",//app使用
            //         "weekdays": "1",
            //         "time": "2021-09-08T23:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnoff"
            //     }],
            //     //定时策略,针对上面的每个任务生效
            //     "validtimes": [["2021-09-08T11:13:00+08:00", "2021-09-10T11:13:00+08:00"]], //必须有开始时间和结束时间,否则无效.如果未带时区且zoneinfo无时区信息,则无效
            //     "invalidtimes": [["2021-10-08T11:13:00+08:00", "2021-10-10T11:13:00+08:00"]],
            //     "donedeal": "keep",//keep表示任务完成时保留,其它值时任务完成时会被删除
            //     "datalist": [
            //         { "datakey": "turnon", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 1 }]] }) },
            //         { "datakey": "turnoff", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 0 }]] }) }
            //     ],
            //     "familyid": "xxxx",  //任务家庭id
            //     "endpoindid": "xxxx",//任务设备id
            //     "userid": "xxxx",
            //     "reqtype": "devControl",
            //     "extend": "mute"//预留字段
            // },
            // {
            //     "jobid": "3",
            //     "enable": true,//必须//任务开关
            //     "timerlist": [{ //定时任务开始时间
            //         "desc": "",
            //         "weekdays": "1",
            //         "time": "2021-09-08T12:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnon"
            //     },
            //     { //定时任务开始时间
            //         "desc": "",//app使用
            //         "weekdays": "1",
            //         "time": "2021-09-08T23:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnoff"
            //     }],
            //     //定时策略,针对上面的每个任务生效
            //     "validtimes": [["2021-09-08T11:13:00+08:00", "2021-09-10T11:13:00+08:00"]], //必须有开始时间和结束时间,否则无效.如果未带时区且zoneinfo无时区信息,则无效
            //     "invalidtimes": [["2021-10-08T11:13:00+08:00", "2021-10-10T11:13:00+08:00"]],
            //     "donedeal": "keep",//keep表示任务完成时保留,其它值时任务完成时会被删除
            //     "datalist": [
            //         { "datakey": "turnon", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 1 }]] }) },
            //         { "datakey": "turnoff", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 0 }]] }) }
            //     ],
            //     "familyid": "xxxx",  //任务家庭id
            //     "endpoindid": "xxxx",//任务设备id
            //     "userid": "xxxx",
            //     "reqtype": "devControl",
            //     "extend": "normal"//预留字段
            // },
            // {
            //     "jobid": "4",
            //     "enable": true,//必须//任务开关
            //     "timerlist": [{ //定时任务开始时间
            //         "desc": "",
            //         "weekdays": "1",
            //         "time": "2021-09-08T12:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnon"
            //     },
            //     { //定时任务开始时间
            //         "desc": "",//app使用
            //         "weekdays": "1",
            //         "time": "2021-09-08T23:13:00",
            //         "zoneinfo": "Asia/Shanghai",
            //         "datakey": "turnoff"
            //     }],
            //     //定时策略,针对上面的每个任务生效
            //     "validtimes": [["2021-09-08T11:13:00+08:00", "2021-09-10T11:13:00+08:00"]], //必须有开始时间和结束时间,否则无效.如果未带时区且zoneinfo无时区信息,则无效
            //     "invalidtimes": [["2021-10-08T11:13:00+08:00", "2021-10-10T11:13:00+08:00"]],
            //     "donedeal": "keep",//keep表示任务完成时保留,其它值时任务完成时会被删除
            //     "datalist": [
            //         { "datakey": "turnon", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 1 }]] }) },
            //         { "datakey": "turnoff", "data": JSON.stringify({ "params": ["pwr"], "vals": [[{ "idx": 1, "val": 0 }]] }) }
            //     ],
            //     "familyid": "xxxx",  //任务家庭id
            //     "endpoindid": "xxxx",//任务设备id
            //     "userid": "xxxx",
            //     "reqtype": "devControl",
            //     "extend": "vacation"//预留字段
            // }
        ]
    }
}
