import { split, combine, isFunction } from "./utils";
import moment from 'moment';
import { cloudTimerApi } from "../../http";
const ACT_ADD = 0, ACT_DELETE = 1, ACT_EDIT = 2, ACT_LIST = 3,
    ACT_SWITCH = 4, ACT_LIMITATION = 5, ACT_SUN_SETTING = 6;

const TYPE_COMMON = 'comm',
    TYPE_DELAY = 'delay',
    TYPE_PERIOD = 'period',
    TYPE_CYCLE = 'cycle',
    TYPE_RAND = 'rand',
    TYPE_ALL = 'all',

    BEFORE_SUN_SET = 'D-',
    BEFORE_SUN_RISE = 'U-',
    AFTER_SUN_SET = 'D+',
    AFTER_SUN_RISE = 'U+';

const _simpleClone = obj => {
    if (!obj || 'object' != typeof obj) {
        return obj;
    }

    const copy = Object.keys(obj).reduce((copy, field) => {
        const val = obj[field];
        let copyVal;
        if (Array.isArray(val)) {
            copyVal = [...val];
        } else if ('object' === typeof val) {
            if (val.clone && isFunction(val.clone)) {
                //如果对象本身提供了clone方法
                copyVal = val.clone();
            } else {
                copyVal = _simpleClone(val);
            }

        } else {
            copyVal = val;
        }
        copy[field] = copyVal;
        return copy;
    }, {});


    return Object.setPrototypeOf(copy, Object.getPrototypeOf(obj));
};


class Time {
    //日出后/日出前/日落前/日落后
    //'U+/U-/D+/D-'
    sun;
    //[日出|日落][前|后]时长
    //moment.duration对象
    duration;
    //任务的周期，0-6 分别表示每周日到每周六
    //数组，如[1,2,3]
    repeat;
    //moment对象，表示日期或者时间
    moment;

    constructor(str) {
        if (str) {
            this.parse(str);
        } else {
            this.moment = moment().startOf('minute').add(1, 'minutes');
        }
    }

    isRepeated() {
        return this.repeat && this.repeat.length > 0;
    }

    parse(str) {
        this.str = str;
        if (str.startsWith(BEFORE_SUN_SET) || str.startsWith(BEFORE_SUN_RISE) || str.startsWith(AFTER_SUN_SET) || str.startsWith(AFTER_SUN_RISE)) {
            //当前为日出日落定时
            this.sun = str.substr(0, AFTER_SUN_RISE.length);
            let timeArr = str.substr(AFTER_SUN_RISE.length).split('_');
            if (timeArr[6] === '*') {
                // year字段为*，表示周期定时
                //eg:U+ 0_30_0_*_*_0,1,3,5_*
                //todo 复用
                let repeatStr = timeArr[5];
                this.repeat = repeatStr === '*' ? [0, 1, 2, 3, 4, 5, 6] : repeatStr.split(',').map(i => parseInt(i));
            } else {
                // year字段有值，单次定时
                //eg:U+ 0_30_0_26_2_*_2018
                this.moment = moment(timeArr.slice(3).join('_'), 'DD_MM_*_YYYY')
            }
            this.duration = moment.duration({
                seconds: timeArr[0],
                minutes: timeArr[1],
                hours: timeArr[2]
            }
            );
        } else {
            //非日出日落定时
            let timeArr = str.split('_');
            if (timeArr[6] === '*') {
                // year字段为*，表示周期定时
                //eg:0_1_22_*_*_0,1,3,5_*
                //todo 复用
                this.repeat = timeArr[5] === '*' ? [0, 1, 2, 3, 4, 5, 6] : timeArr[5].split(',').map(i => parseInt(i));
                this.moment = moment(timeArr.slice(0, 3).join('_'), 'ss_mm_HH')
            } else {
                // year字段有值，单次定时
                //eg:0_1_22_26_2_*_2018
                this.moment = moment(str, 'ss_mm_HH_DD_MM_*_YYYY');
            }
        }
    }

    clone() {
        return _simpleClone(this);
    }

    toString() {
        const { sun, duration, moment, repeat } = this;
        if (sun) {
            //sun不为空，需要从duration中解析出 秒_分_时
            //注意：这里的‘秒_分_时 ’指时长，不是时刻
            const sunPart = `${sun}${duration.seconds()}_${duration.minutes()}_${Math.floor(duration.asHours())}`;
            if (repeat && repeat.length > 0) {
                //repeat不为空，表示周期定时。则无需moment值（不需要日期信息）
                //返回格式：sun_duration_*_*_repeat_*
                //如：'U- 0_30_0_*_*_0,1,3,5_*'
                return `${sunPart}_*_*_${repeat.join(",")}_*`;
            } else {
                //repeat为空，表示单次执行
                //需要从moment值中解析出日期信息 年/月/日
                //返回格式：sun_duration_日_月_*_年
                //如：'U- 0_30_0_11_12_*_2018'
                return `${sunPart}_${moment.format("DD_MM_*_YYYY")}`;
            }
        } else {
            //sun空，则无需duration值
            if (repeat && repeat.length > 0) {
                //repeat不为空，表示周期定时
                //需要从moment中解析出 秒_分_时 （不需要日期信息）
                //注意：这里的‘秒_分_时 ’指时刻
                //返回格式：秒_分_时_*_*_repeat_*
                //如：'0_1_22_*_*_0,1,3,5_*'
                return `${moment.format("ss_mm_HH")}_*_*_${repeat.join(",")}_*`;
            } else {
                //repeat为空，表示单次执行
                //需要从moment值中解析出日期与时刻的信息 年-月-日-时-分-秒
                //返回格式：秒_分_时_日_月_*_年
                //如：'0_1_22_26_2_*_2018'
                return moment.format("ss_mm_HH_DD_MM_*_YYYY");
            }

        }
    }
}

class Timer {

    type;
    id;
    en;
    name;
    cmd;

    constructor(task) {
        if (typeof task === 'object') {
            Object.assign(this, task);

            this._override(cmd => combine(cmd), 'cmd', 'cmd1', 'cmd2')
                ._override(time => new Time(time), 'time', 'stime', 'etime')
                ._override(en => !!en, 'en')
                ._override(duration => moment.duration(duration, 'seconds'), 'time1', 'time2');
        } else if (typeof task === 'string') {
            this.type = task;
            this.cmd = {};
            this.en = true;
            this.name = 'anonymous' + Math.floor(Math.random() * 100);
            if (TYPE_COMMON === task || TYPE_DELAY === task) {
                this.time = new Time();
            } else if (TYPE_PERIOD === task) {
                this.time = new Time();
                this.time.repeat = [0, 1, 2, 3, 4, 5, 6];
            } else if (TYPE_RAND === task || TYPE_CYCLE === task) {
                this.stime = new Time();
                this.etime = new Time();
                this.etime.moment.add(2, 'hours');
                this.time1 = moment.duration(1, 'minutes');
                this.time2 = moment.duration(1, 'minutes');
            }
        }

    }

    setRepeat(repeat) {
        if (this.type === TYPE_RAND || this.type === TYPE_CYCLE) {
            this.stime.repeat = repeat;
            this.etime.repeat = repeat;
        } else {
            this.time.repeat = repeat;
        }
    }

    getRepeat() {
        if (this.type === TYPE_RAND || this.type === TYPE_CYCLE) {
            return this.stime.repeat;
        } else {
            return this.time.repeat;
        }
    }

    isRepeated() {
        if (this.type === TYPE_RAND || this.type === TYPE_CYCLE) {
            return this.stime.isRepeated() && this.etime.isRepeated();
        } else {
            return this.time.isRepeated();
        }
    }

    _override(fn, ...fields) {
        fields.forEach(field => {
            if (this[field] != null) {
                this[field] = fn(this[field]);
            }
        });
        return this;
    }

    clone() {
        return _simpleClone(this);
    }

    toOriginal() {
        const reps = Object.assign({}, this);
        const override = this._override.bind(reps);
        override(cmd => split(cmd), 'cmd', 'cmd1', 'cmd2');
        override(time => time.toString(), 'time', 'stime', 'etime');
        override(en => en ? 1 : 0, 'en');
        override(duration => duration.asSeconds(), 'time1', 'time2');
        return reps;
    }

}

export function isEmpty(val) {
    let r = (val == '' || val == null || val == 'undefined');
    return r;
};

let _taskdata = { "did": "", "total": 0, "index": 0, "ver": 207, "comm_limits": [1, 16, 3], "delay_limits": [1, 16, 0], "period_limits": [1, 16, 2], "cycle_limits": [1, 2, 1], "rand_limits": [1, 2, 0], "timerlist": [], "status": 0 }
window.localStorage.taskV2 = isEmpty(window.localStorage.taskV2) ? JSON.stringify(_taskdata) : window.localStorage.taskV2;

const call = async (request) => {
    return Promise.resolve({ "status": 0, "msg": ` ${request} 操作成功` });
};

//新定时
//添加、编辑定时  参数tasks格式：[{"type":"comm","en":true,"name":"anonymous20","time":{"moment":"2018-12-25 19:29:00"},"cmd":{"pwr":1}}]
const add = function (...tasks) {
    let taskdata = JSON.parse(window.localStorage.taskV2);
    let _tasks = tasks;
    if (tasks[0].did && tasks[0].timerlist) {
        _tasks = tasks[0].timerlist;
    }
    const idlist = [];
    for (let _task of _tasks) {
        let task = _task.toOriginal();
        let task_type = task.type;
        let id = 0;
        if (task.id >= 0) {//修改
            id = task.id;
            taskdata.timerlist.map((this_task, index) => {
                if (this_task.type == task_type && this_task.id == id) {
                    taskdata.timerlist[index] = task;
                }
            })
        } else {//添加
            taskdata.timerlist.map((this_task, index) => {
                if (this_task.type == task_type) {
                    id = this_task.id + 1;
                }
            })
            task.id = id;
            taskdata.timerlist.push(task);
            taskdata.total++;
            taskdata[task_type + "_limits"][2]++;
        }
        idlist.push(id)
    }

    window.localStorage.taskV2 = JSON.stringify(taskdata);
    return Promise.resolve({ "status": 0, idlist });


};
//查询定时
const list = async function ({ type = TYPE_ALL, count = 10, index = 0, did } = {}) {
    let resp = JSON.parse(window.localStorage.taskV2);
    console.log('localStorage.taskV2', resp.timerlist)
    resp.timerlist = resp.timerlist.map(t => new Timer(t));
    return Promise.resolve(resp);
};
//删除定时   参数tasks格式：[{"uuid":"0-comm","id":0,"type":"comm"}]
const del = function (...tasks) {//支持批量删除
    console.error('del:', JSON.stringify(tasks));
    let taskdata = JSON.parse(window.localStorage.taskV2);
    if (tasks[0].did && tasks[0].timerlist) {
        const list = tasks[0].timerlist;
        const idlist = list.filter(t => t.id);
        const delType = list[0].type;
        taskdata.timerlist = taskdata.timerlist.filter((_task) => (delType === _task.type && !idlist.includes(_task.id)) || delType !== _task.type)
        window.localStorage.taskV2 = JSON.stringify(taskdata);
        return Promise.resolve({ "status": 0, "idlist": idlist });
    } else {
        taskdata.total--;
        let task = tasks[0]
        let del_type = task.type;
        let id = task.id;
        taskdata[del_type + "_limits"][2]--;
        taskdata.timerlist.map((this_task, index) => {
            if (this_task.type == del_type && this_task.id == id) {
                taskdata.timerlist.splice(index, 1);
            }
        })
        window.localStorage.taskV2 = JSON.stringify(taskdata);
        return Promise.resolve({ "status": 0, "idlist": [id] });
    }

};

const sunSetting = function (setting) {
    return Promise.resolve({ "status": 0, "did": "XXXXXXX", "ver": 27 });
};

const getLimitation = function ({ type } = {}) {
    return Promise.resolve({ "status": 0, "did": "XXXXXXX", "sun": ["longitude", "latitude"], "comm_limits": [1, 8, 2], "delay_limits": [1, 8, 2], "period_limits": [1, 8, 2], "cycle_limits": [1, 8, 2] });
};

export default {
    add, list, del, sunSetting, getLimitation, call, Timer,
    TYPE_COMMON,
    TYPE_DELAY,
    TYPE_PERIOD,
    TYPE_CYCLE,
    TYPE_RAND,
    TYPE_ALL,

    BEFORE_SUN_SET,
    BEFORE_SUN_RISE,
    AFTER_SUN_SET,
    AFTER_SUN_RISE
};