import moment, { Moment } from "moment";
import { Attribute, BatchesItem } from "@common/http/index";
import { QueryTimerRes, UpsertTimerRes, DeleteTimerRes, BatchesUpdateRes } from "../timerFactory/CRUDType";
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import TimerTwins from '../timerFactory/Timer';
import { timerQuery, timerDelete, timerUpsert, timerBatchesUpdate } from '@common/http';

export const deleteTimer: any = createAsyncThunk(
    'timer/deleteTimer',
    async ({ id, callback }: { id: string | string[], callback?: () => void }) => {
        const _id = typeof id === 'string' ? [id] : id;
        const res = await timerDelete(..._id);
        if (res.status === 0) callback && callback();
        return res
    }
);

export const queryTimer: any = createAsyncThunk(
    'timer/queryTimer',
    async (arg, { getState, dispatch }) => {
        const res = await timerQuery();
        const errTimers = res.payload.timerlist.filter(timer => !timer.timers)
        if (errTimers.length > 0) {
            dispatch(deleteTimer({ id: errTimers.map(timer => timer.jobid) }))
        }
        return res
    }
);
export const upsertTimer: any = createAsyncThunk(
    'timer/upsertTimer',
    async ({ timer, callback }: { timer?: TimerTwins, callback?: () => void }, { getState, dispatch }) => {
        const { timer: { currentTimer, outHomevalidtimes, atHomevalidtimes, all } } = getState() as State;
        const _timer = timer || currentTimer;
        const res = await timerUpsert(_timer.parse2Origin())
        if (res.status === 0) callback && callback();
        if (res.status === 0 && _timer.extern === 'vacation_out_home') {
            // if (outHomevalidtimes[0]?.format('YYYY-MM-DD') !== _timer.validtimes[0][0]?.format('YYYY-MM-DD') ||
            //     outHomevalidtimes[1]?.format('YYYY-MM-DD') !== _timer.validtimes[0][1]?.format('YYYY-MM-DD')) {
            //批量更新时间
            const vacationTimers = all.filter(timer => timer.extern === 'vacation');
            const athomeEn = judgeAthome(vacationTimers);
            let normalInvalidtimes: any;
            if (_timer.enable) {
                normalInvalidtimes = [..._timer.validtimes];
            } else {
                normalInvalidtimes = []
            }

            if (atHomevalidtimes.length > 0 && athomeEn) {
                normalInvalidtimes.push(atHomevalidtimes as [Moment, Moment])
            }
            if (all.filter(timer => timer.extern === 'normal').length > 0) {
                dispatch(batchesUpdateTimers({
                    attributes: [{
                        name: 'invalidtimes',
                        value: normalInvalidtimes
                    }], timerType: 'normal'
                }))
            }
            if (all.filter(timer => timer.extern === 'eco').length > 0) {
                dispatch(batchesUpdateTimers({
                    attributes: [{
                        name: 'invalidtimes',
                        value: _timer.enable ? _timer.validtimes : []
                    }], timerType: 'eco'
                }))
            }
            if (all.filter(timer => timer.extern === 'vacation').length > 0) {
                dispatch(batchesUpdateTimers({
                    attributes: [{
                        name: 'invalidtimes',
                        value: _timer.enable ? _timer.validtimes : []
                    }], timerType: 'vacation'
                }))
            }

            // }
        }
        return res
    }
);


export const batchesUpdateTimers: any = createAsyncThunk(
    'timer/batchesUpdateTimers',
    async ({ attributes, timerType = 'normal', callback }: { attributes: Attribute[], timerType: 'normal' | 'vacation', callback?: () => void }, { getState }) => {
        const { timer: { all } } = getState() as State;
        const _attributes = attributes.map(attr => {
            if (attr.name === 'validtimes' || attr.name === 'invalidtimes') {
                attr.value = (attr.value as any[]).map(([m1, m2]: [Moment, Moment]) => {
                    if (m1 && m2) {
                        return [m1.format(), m2.format()]
                    } else {
                        return []
                    }
                })
            }
            return attr
        })
        const _timers: BatchesItem[] = all.filter(timer => timerType.split('&').includes(timer.extern))
            .map(timer => ({ jobid: timer.jobid, attributes: _attributes }));

        const res = await timerBatchesUpdate(_timers);
        if (res.status === 0) callback && callback();
        return res;
    }
);

const normalTimer = new TimerTwins('normal');
interface TimerStateType {
    currentTimer: TimerTwins,
    timerloading: boolean,
    all: TimerTwins[],
    outHomevalidtimes: Moment[],
    atHomevalidtimes: Moment[],
    tabType: 'left' | 'right',
    vacationType: 'athome' | 'outhome'
}

export const timerSlice = createSlice({
    name: 'timer',
    initialState: {
        currentTimer: normalTimer,
        timerloading: false,
        all: [],
        outHomevalidtimes: [],
        atHomevalidtimes: [],
        tabType: 'left',
        vacationType: 'outhome'
    } as TimerStateType,
    reducers: {
        timerloading: (state, action) => {
            state.timerloading = action.payload;
        },
        setTabType: (state, action) => {
            state.tabType = action.payload;
        },
        setVacationType: (state, action) => {
            state.vacationType = action.payload;
        },
        setcurrentTimer: (state, action: { type: string, payload: TimerTwins }) => {
            state.currentTimer = action.payload;
        },
        // setInvalidtimes: (state, action: { type: string, payload: typeof normalTimer.invalidtimes }) => {
        //     state.invalidtimes = action.payload;
        // },
        setAtHomevalidtimes: (state, action: { type: string, payload: [Moment, Moment] }) => {
            state.atHomevalidtimes = action.payload;
        },
    },
    extraReducers: {
        [queryTimer.pending]: (state, action) => {
            console.log('---queryTimer.pending---', action);
            if (action.meta.arg) {
                state.timerloading = true;
            }
        },
        [queryTimer.fulfilled]: (state, action) => {
            state.timerloading = false;

            const { payload, status } = action.payload as QueryTimerRes;
            if (status !== 0) return;
            state.all = payload.timerlist.map(timer => new TimerTwins(timer));
            // const normalTimer = state.all.filter(timer => timer.extern === 'normal');
            const [vacationTimer] = state.all.filter(timer => timer.extern === 'vacation');
            const [outHomeVacationTimer] = state.all.filter(timer => timer.extern === 'vacation_out_home');
            if (outHomeVacationTimer) {
                state.outHomevalidtimes = outHomeVacationTimer.validtimes[0];
            }
            if (vacationTimer) {
                state.atHomevalidtimes = vacationTimer.validtimes[0];
            }

        },
        [upsertTimer.pending]: (state, action) => {
            state.timerloading = true;
        },
        [upsertTimer.fulfilled]: (state, action) => {
            state.timerloading = false;
            const { payload, status } = action.payload as UpsertTimerRes;
            if (status !== 0) return;
            let _timer: TimerTwins;
            const { timer } = action.meta.arg as { timer: TimerTwins };
            _timer = timer || state.currentTimer;
            if (_timer.jobid) {//更新
                const i = state.all.findIndex(t => t.jobid === _timer.jobid);
                state.all[i] = _timer;
                if (_timer.extern === 'vacation_out_home') {
                    state.outHomevalidtimes = _timer.validtimes[0]
                }
            } else {//添加
                _timer.jobid = payload.jobid;
                state.all.unshift(_timer);
            }
            if (_timer.extern === 'vacation_out_home') {//同时设置度假在家定时invalidtimes，与
                state.outHomevalidtimes = _timer.validtimes[0];
            }
            if (_timer.extern === 'vacation') {
                state.atHomevalidtimes = _timer.validtimes[0];
            }
            // state.all = payload.timerlist.map(timer => new TimerTwins(timer));
        },
        [deleteTimer.pending]: (state, action) => {
            state.timerloading = true;
        },
        [deleteTimer.fulfilled]: (state, action) => {
            state.timerloading = false;
            const { status } = action.payload as DeleteTimerRes;
            if (status !== 0) return;

            const { id } = action.meta.arg as { id: string | string[] };
            state.all = state.all.filter(timer => {
                if (typeof id === 'string') {
                    return timer.jobid !== id
                } else {
                    return !id.includes(timer.jobid)
                }
            })
        },
        [batchesUpdateTimers.pending]: (state, action) => {
            state.timerloading = true;
        },
        [batchesUpdateTimers.fulfilled]: (state, action) => {
            state.timerloading = false;
            const { status } = action.payload as BatchesUpdateRes;
            if (status !== 0) return;
            const { attributes, timerType } = action.meta.arg as { attributes: Attribute[], timerType: 'normal' | 'vacation' };
            const attributesKeyVal = {} as any;
            for (const attribute of attributes) {
                if (attribute.name === 'validtimes' || attribute.name === 'invalidtimes') {
                    attributesKeyVal[attribute.name] = (attribute.value as [string, string][]).map(([m1, m2]) => [moment(m1), moment(m2)])
                } else {
                    attributesKeyVal[attribute.name] = attribute.value
                }

            }
            state.all = state.all.map(timer => {
                if (timer.extern === timerType) {
                    return Object.assign(timer, attributesKeyVal)
                } else {
                    return timer
                }
            })
            if (timerType === 'vacation' && attributesKeyVal?.validtimes) {
                state.atHomevalidtimes = attributesKeyVal?.validtimes[0];
            }

        },
    }
});

export default timerSlice.reducer;

export const { timerloading, setcurrentTimer, setTabType, setVacationType, setAtHomevalidtimes } = timerSlice.actions;

interface State {
    timer: TimerStateType
}

export const getTimerLoading = (state: State) => state.timer.timerloading;

export const getTimeTabType = (state: State) => state.timer.tabType;

export const getVacationType = (state: State) => state.timer.vacationType;

export const getAllTimer = (state: State) => state.timer.all;

export const getCurrentTimer = (state: State) => state.timer.currentTimer;

export const getAtHomeValidTimes = (state: State) => state.timer.atHomevalidtimes;

export const getOutHomeValidTimes = (state: State) => state.timer.outHomevalidtimes;

export const getEcoTimer = createSelector([getAllTimer], (all) => {
    return all.filter(timer => timer.extern === 'eco')
})

export const getMuteTimer = createSelector([getAllTimer], (all) => {
    const [timer1, timer2] = all.filter(timer => timer.extern === 'mute1' || timer.extern === 'mute2');
    if (timer1 || timer2) {
        if (timer1?.extern === 'mute1' || timer2?.extern === 'mute2') return [timer1, timer2]
        return [timer2, timer1]
    } else {
        return []
    }
})

export const getNormalTimer = createSelector([getAllTimer], (all) => {
    return all.filter(timer => timer.extern === 'normal')
})

export const getNormalEverydayTimer = createSelector([getNormalTimer], (all) => {
    return all.filter(timer => timer.startTimer.repeat.join('') === '1234567' && timer.endTimer.repeat.join('') === '1234567')
})

export const getNormalPeriodTimer = createSelector([getNormalTimer], (all) => {
    return all.filter(timer => timer.startTimer.repeat.join('') !== '1234567')
})

export const getVacationTimer = createSelector([getAllTimer], (all) => {
    return all.filter(timer => timer.extern === 'vacation')
})

export const getVacationOutHomeTimer = createSelector([getAllTimer], (all) => {
    return all.filter(timer => timer.extern === 'vacation_out_home')
})

export const getOutHomeFlag = createSelector([getVacationOutHomeTimer], ([vacationOutHomeTimer]) => !!vacationOutHomeTimer?.enable)

export const getAthomeEn = createSelector([getVacationTimer], judgeAthome)

function judgeAthome(vacationTimers: TimerTwins[]) {
    if (vacationTimers.length <= 0) {
        return false
    }
    const _vacationTimer1 = vacationTimers[0];
    for (const [invalid1, invalid2] of _vacationTimer1.invalidtimes) {
        if (!invalid1 || !invalid2) continue;
        if (parseInt(invalid2.format('YYYY')) - parseInt(invalid1.format('YYYY')) >= 50) {//50年代表关闭使能
            return false
        }
    }
    return true
}