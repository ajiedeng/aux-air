import Page from "@components/Page";
import Navbar from "@components/Navbar";
import Tab from "@panel/pages/timer/components/tab";
import { useFormatMessage } from "@hooks";
import style from './style.module.scss'
import moment, { Moment } from "moment";
import TimerTwins from "@panel/pages/timer/timerFactory/Timer";
import {
    useDispatch, useSelector,
} from "react-redux";
import { useHistory } from "react-router";
import React, { useCallback, useMemo } from "react";
import FunctionBar from "@panel/pages/main/FunctionBar";
import Switcher from "@common/components/Switcher";
import TxtArrow from "@common/components/TxtArrow";
import TimerListBar from "@panel/pages/timer/components/timerBar";
import toast from '@components/Toast'
import { setcurrentTimer, getAtHomeValidTimes, getOutHomeValidTimes, upsertTimer, setVacationType, getVacationType, batchesUpdateTimers, getVacationTimer, getVacationOutHomeTimer, getNormalTimer } from "@panel/pages/timer/timerSlice";

export default function VacationMain() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory();
    const select = useSelector(getVacationType);
    const vacationTimers = useSelector(getVacationTimer);
    const athomeEn = useMemo(() => {
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
    }, [vacationTimers])
    const atHomeValidTimes = useSelector(getAtHomeValidTimes) as [Moment, Moment];
    const outHomeValidTimes = useSelector(getOutHomeValidTimes) as [Moment, Moment];
    const [vacationOutHomeTimer] = useSelector(getVacationOutHomeTimer);
    const normalTimer = useSelector(getNormalTimer);
    const outHomeFlag = useMemo(() => !!vacationOutHomeTimer?.enable, [vacationOutHomeTimer]);
    const outHomeHPOn = useMemo(() => !!vacationOutHomeTimer?.startTimer?.cmd?.hp_pwr, [vacationOutHomeTimer]);
    const outHomeACOn = useMemo(() => !!vacationOutHomeTimer?.startTimer?.cmd?.ac_pwr, [vacationOutHomeTimer]);

    const toggleOuthome = useCallback((en: boolean) => {
        const _vacationOutHomeTimer = vacationOutHomeTimer?.clone() || new TimerTwins('vacation_out_home');
        const end = _vacationOutHomeTimer.endTimer.moment;
        const vacationStart = moment().add(1, 'd').hour(0).minute(0);
        const vacationEnd = moment().add(1, 'd').hour(23).minute(59);
        if (end.isAfter(moment())) {//未过期
            _vacationOutHomeTimer.enable = en;

        } else {//过期
            _vacationOutHomeTimer.enable = en;
            _vacationOutHomeTimer.startTimer.moment = vacationStart;
            _vacationOutHomeTimer.endTimer.moment = vacationEnd;
            _vacationOutHomeTimer.validtimes = [[vacationStart, vacationEnd]]
        }
        dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))

    }, [vacationOutHomeTimer, dispatch]);



    const toggleAthome = useCallback((en: boolean) => {
        //vacationStart,vacationEnd差距50年，默认为关闭度假在家
        const vacationStart = moment().add(1, 'd').hour(0).minute(0);
        const vacationEnd = moment().add(50, 'y').hour(23).minute(59);
        const _vacationTimer = vacationTimers[0]?.clone() || new TimerTwins('vacation', { enable: false });

        let invalidtimes: [Moment, Moment][];
        if (en) {//打开在家
            invalidtimes = outHomeFlag ? [outHomeValidTimes] : [];
        } else {//关闭在家
            invalidtimes = outHomeFlag ? [outHomeValidTimes, [vacationStart, vacationEnd]] : [[vacationStart, vacationEnd]];
        }
        invalidtimes = invalidtimes.filter(times => !!times);
        if (vacationTimers.length <= 1) {
            _vacationTimer.invalidtimes = invalidtimes;
            dispatch(upsertTimer({ timer: _vacationTimer }))

        } else {//批量处理,批量开关vacation定时
            dispatch(batchesUpdateTimers({
                attributes: [{
                    name: 'invalidtimes',
                    value: invalidtimes
                }], timerType: 'vacation'
            }))
        }
        //需要批量更新普通定时invalid字段
        if (normalTimer.length > 0) {
            let _invalidtimes: [Moment, Moment][];
            _invalidtimes = outHomeFlag ? [outHomeValidTimes] : [];
            if (en) {
                _invalidtimes.push(..._vacationTimer.validtimes);
            }
            dispatch(batchesUpdateTimers({
                attributes: [{
                    name: 'invalidtimes',
                    value: _invalidtimes
                }], timerType: 'normal'
            }))
        }

    }, [vacationTimers, normalTimer.length, outHomeFlag, outHomeValidTimes, dispatch]);

    const toggleHP = useCallback((en: boolean) => {
        const _vacationOutHomeTimer = vacationOutHomeTimer?.clone();
        Object.assign(_vacationOutHomeTimer.startTimer.cmd, { hp_pwr: en ? 1 : 0 })
        dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))
    }, [vacationOutHomeTimer, dispatch])

    const toggleAC = useCallback((en: boolean) => {
        const _vacationOutHomeTimer = vacationOutHomeTimer?.clone();
        Object.assign(_vacationOutHomeTimer.startTimer.cmd, en ? { ac_pwr: 1, ac_mode: 4 } : { ac_pwr: 0 });
        if (en) {
            Object.assign(_vacationOutHomeTimer.startTimer.cmd, { ac_pwr: 1, ac_mode: 4 });
        } else {
            delete _vacationOutHomeTimer.startTimer.cmd.ac_pwr;
            delete _vacationOutHomeTimer.startTimer.cmd.ac_mode;
        }
        dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))
    }, [vacationOutHomeTimer, dispatch])

    const add = () => {
        if (vacationTimers.length >= 6) {
            return toast.info('vacationTimerTips')
        }
        const timer = new TimerTwins('vacation');
        //需要修改validtimes与invalidtimes
        if (outHomeValidTimes.length > 0 && outHomeFlag) {
            timer.invalidtimes = [outHomeValidTimes];
        }
        if (atHomeValidTimes.length > 0 && athomeEn) {
            timer.validtimes = [atHomeValidTimes];
        }
        dispatch(setcurrentTimer(timer));
        history.push('/timer/timerSetting/add')
    }
    const outHomeValidtimeStr = useMemo(() => {
        if (outHomeValidTimes.length > 0) {
            return `${outHomeValidTimes[0]?.format('YYYY-MM-DD')} - ${outHomeValidTimes[1]?.format('YYYY-MM-DD')}`
        }
        return ''
    }, [outHomeValidTimes])

    const atHomeValidtimeStr = useMemo(() => {
        if (atHomeValidTimes.length > 0) {
            return `${atHomeValidTimes[0]?.format('YYYY-MM-DD')} - ${atHomeValidTimes[1]?.format('YYYY-MM-DD')}`
        }
        return ''
    }, [atHomeValidTimes])

    const go2validPeriod = () => {
        dispatch(setcurrentTimer(vacationOutHomeTimer));
        history.push('/vacation/validPeriod/outhome')
    }

    const onSelectVacationType = (val: "left" | "right") => {
        dispatch(setVacationType(val === 'left' ? 'outhome' : 'athome'));
    }


    return (
        <Page className={style.vacationPage}>
            <Navbar title={intl('vacation')} className={style.navbar} />
            <div className={style.vcation}>
                <Tab left={intl('outhome')} right={intl('vathome')} onSelect={onSelectVacationType} curPosition={select === 'athome' ? 'right' : 'left'} />
            </div>
            {
                select === "outhome" &&
                <div className={style.outhome}>
                    <FunctionBar title={intl('outhome')}><Switcher intimer on={outHomeFlag} onChange={toggleOuthome} /></FunctionBar>
                    {
                        outHomeFlag &&
                        <div className={style.outHomeFlag}>
                            <FunctionBar merge show={true} title={intl('ValidPeriod')} onClick={go2validPeriod}>
                                <TxtArrow title={outHomeValidtimeStr} /></FunctionBar>
                            <FunctionBar merge show={true} title={intl('HotWaterenabled')} ><Switcher intimer on={outHomeHPOn} onChange={toggleHP} /></FunctionBar>
                            <FunctionBar merge show={true} title={intl('ACenabled')} ><Switcher intimer on={outHomeACOn} onChange={toggleAC} /></FunctionBar>
                        </div>
                    }
                </div>
            }
            {
                select === "athome" &&
                <div className={style.atHome}>
                    <FunctionBar title={intl('vathome')}><Switcher intimer on={athomeEn} onChange={toggleAthome} /></FunctionBar>
                    {athomeEn && <React.Fragment>
                        <div className={style.timerlistContainer}>
                            <FunctionBar show={true} title={intl('ValidPeriod')} onClick={() => history.push('/vacation/validPeriod/athome')}>
                                <TxtArrow title={atHomeValidtimeStr} /></FunctionBar>
                            {vacationTimers.map(timer => <TimerListBar key={timer.jobid} timer={timer} />)}
                        </div>
                        <div className={style.button} onClick={add}>{intl('timerSetting')}</div>
                    </React.Fragment>}
                </div>
            }


        </Page>
    )
}