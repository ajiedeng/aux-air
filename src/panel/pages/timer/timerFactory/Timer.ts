import { UpsertTimer } from "@common/http/index";
import moment, { Moment } from "moment";
import { TimerItem, TimerContent, OnOFF } from "./timerType";
import { origin2KeyVal, keyVal2Origin, simpleClone } from "@common/util";
interface Cmd {
    [param: string]: string | number
}
interface TimerTask<T extends OnOFF> extends TimerContent<T> {
    data: string
}
type OriginCmd = ReturnType<typeof keyVal2Origin>;
export class Timer {
    desc!: string;
    weekdays!: string;
    time!: string;
    zoneinfo!: 'Asia/Shanghai';
    datakey!: OnOFF;
    moment!: Moment;
    repeat!: number[];
    cmd!: Cmd
    constructor(task: TimerTask<OnOFF>) {
        Object.assign(this, task);
        this.moment = moment(task.time);
        this.repeat = task.weekdays.split('').map(str => parseInt(str)).sort((a, b) => a - b);
        this.cmd = origin2KeyVal(JSON.parse(task.data));
    }
    clone() {
        return simpleClone(this);
    }
    parse2Origin<T extends OnOFF>(): [TimerContent<T>, { datakey: T, data: string }] {
        return [
            {
                desc: this.desc,
                weekdays: this.repeat.join(''),
                time: this.moment.format(),
                zoneinfo: this.zoneinfo,
                datakey: this.datakey
            } as TimerContent<T>,
            {
                datakey: (this as any).datakey,
                data: JSON.stringify(keyVal2Origin((this as any).cmd))
            }
        ]
    }
}

export type TimerType = 'eco' | 'mute1' | 'mute2' | 'mute' | 'normal' | 'vacation' | 'vacation_out_home';
export default class TimerTwins {
    jobid!: string;
    enable!: boolean;
    startTimer!: Timer;
    endTimer!: Timer;
    validtimes!: [Moment, Moment][];
    invalidtimes!: [Moment, Moment][];
    extern!: TimerType;
    constructor(config: TimerType | TimerItem, subConfig?: { weekdays?: string, enable?: boolean }) {
        if (typeof config === 'object') {
            this.timerItem2Twins(config)
        } else {
            this.newTwinsWithType(config, { weekdays: subConfig?.weekdays, enable: subConfig?.enable })
        }

    };
    newTwins({ type = 'normal', enable = true, weekdays = '1234567', times = [moment().hour(8).minute(0), moment().hour(19).minute(0)],
        data = {
            turnon: keyVal2Origin({ ac_pwr: 1 }),
            turnoff: keyVal2Origin({ ac_pwr: 0 })
        }, zoneinfo = "Asia/Shanghai", validtimes = [], invalidtimes = [] }:
        { type?: TimerType, enable?: boolean, weekdays?: string, times?: [Moment, Moment], data?: { turnon: OriginCmd, turnoff: OriginCmd }, zoneinfo?: "Asia/Shanghai", validtimes?: [Moment, Moment][], invalidtimes?: [Moment, Moment][] }) {
        this.jobid = '';
        this.enable = enable;
        this.startTimer = new Timer({
            desc: '',
            weekdays: weekdays,
            time: times[0].format(),
            zoneinfo,
            datakey: 'turnon',
            data: JSON.stringify(data.turnon)
        });
        this.endTimer = new Timer({
            desc: '',
            weekdays: weekdays,
            time: times[1].format(),
            zoneinfo,
            datakey: 'turnoff',
            data: JSON.stringify(data.turnoff)
        });
        this.validtimes = validtimes;
        this.invalidtimes = invalidtimes;
        this.extern = type;
    };
    newTwinsWithType(type: TimerType, { weekdays, enable }: { weekdays?: string, enable?: boolean }) {
        const vacationStart = moment().add(1, 'd').hour(0).minute(0);
        const vacationEnd = moment().add(1, 'd').hour(23).minute(59);
        switch (type) {
            case 'eco':
                this.newTwins({
                    type,
                    weekdays: '1234567',
                    data: {
                        turnon: keyVal2Origin({ ecomode: 1 }),
                        turnoff: keyVal2Origin({ ecomode: 0 })
                    }
                });
                break;
            case 'mute':
            case 'mute1':
            case 'mute2':
                this.newTwins({
                    type,
                    weekdays: '1234567',
                    times: type === 'mute1' ? [moment().hour(12).minute(0), moment().hour(15).minute(0)] : [moment().hour(19).minute(0), moment().hour(23).minute(0)],
                    data: {
                        turnon: keyVal2Origin({ qtmode: 1 }),
                        turnoff: keyVal2Origin({ qtmode: 0 })
                    }
                });
                break;
            case 'vacation':
                this.newTwins({
                    type,
                    enable,
                    weekdays: '1234567',
                    validtimes: [[vacationStart, vacationEnd]],
                    data: {
                        turnon: keyVal2Origin({ ac_pwr: 1, ac_mode: 1, ac_temp: 70 }),
                        turnoff: keyVal2Origin({ ac_pwr: 0 })
                    }
                });
                break;
            case 'vacation_out_home':

                this.newTwins({
                    type,
                    weekdays: '',
                    times: [vacationStart, vacationEnd],
                    validtimes: [[vacationStart, vacationEnd]],
                    data: {
                        turnon: keyVal2Origin({ hp_auto_wtemp: 0, ecomode: 0, hp_pwr: 1, ac_pwr: 1, ac_mode: 4 }),
                        turnoff: keyVal2Origin({ hp_auto_wtemp: 0, ecomode: 0, hp_pwr: 0, ac_pwr: 0, qtmode: 0, hp_fast_hotwater: 0 })
                    }
                });
                break;

            case 'normal':
                this.newTwins({
                    type,
                    weekdays: weekdays || '1234567',
                    data: {
                        turnon: keyVal2Origin({ ac_pwr: 1, ac_mode: 1, ac_temp: 70 }),
                        turnoff: keyVal2Origin({ ac_pwr: 0 })
                    }
                });
                break;
            default:
                break;
        }
    };
    timerItem2Twins(timerItem: TimerItem) {
        Object.assign(this, timerItem);
        const start = timerItem.timers[0];
        const end = timerItem.timers[1];

        const { data: startDataStr } = timerItem.datalist[0];
        const startData = JSON.parse(startDataStr)?.directive?.payload;

        const { data: endDataStr } = timerItem.datalist[1];
        const endData = JSON.parse(endDataStr)?.directive?.payload;

        const startCmd = { datakey: "turnon", data: JSON.stringify(startData) } as (typeof timerItem.datalist[0]);
        const endCmd = { datakey: "turnoff", data: JSON.stringify(endData) } as (typeof timerItem.datalist[1]);

        this.startTimer = new Timer({ ...start, ...startCmd });
        this.endTimer = new Timer({ ...end, ...endCmd });
        this.validtimes = timerItem.validtimes?.map(([m1, m2]) => [moment(m1), moment(m2)]) || [];
        this.invalidtimes = timerItem.invalidtimes?.map(([m1, m2]) => [moment(m1), moment(m2)]) || [];
    };
    clone() {
        return simpleClone(this);
    };
    parse2Origin(): UpsertTimer {
        const [start, startCmd] = this.startTimer.parse2Origin<'turnon'>();
        const [end, endCmd] = this.endTimer.parse2Origin<'turnoff'>();
        return {
            jobid: this.jobid,
            enable: this.enable,
            timers: [start, end],
            validtimes: this.validtimes.map(([m1, m2]) => [m1.format(), m2.format()]),
            invalidtimes: this.invalidtimes.map(([m1, m2]) => [m1.format(), m2.format()]),
            datalist: [startCmd, endCmd],
            extern: this.extern
        }
    }
}