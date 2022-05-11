/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 15:21:27
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\timer\timerList\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import Page from "@components/Page";
import Navbar from "@components/Navbar";
import { useFormatMessage } from "@hooks";
import style from './style.module.scss'
import {
    useDispatch, useSelector,
} from "react-redux";
import { useHistory } from "react-router";
import { useMemo, useCallback, useEffect } from "react";
import { getNormalPeriodTimer, getNormalEverydayTimer, setcurrentTimer, setTabType, getTimeTabType, getVacationOutHomeTimer, getVacationTimer, queryTimer, getAtHomeValidTimes, getOutHomeValidTimes, getAthomeEn, getOutHomeFlag } from "../timerSlice";
import noTimerHolder from '@img/noTimerHolder.png'
import TimerTwins from "../timerFactory/Timer";
import TimerListBar from "../components/timerBar";
import Tab from "../components/tab";
import toast from '@components/Toast'
import { getDeviceID } from "@common/root/deviceStateSlice";
import { getFamilyId, getUserId } from "@common/root/globalSlice";
import moment, { Moment } from 'moment';


const TimerPlaceHolder = ({ type }: { type: 'reload' | 'notimer' }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const intl = useFormatMessage();
    const athomeEn = useSelector(getAthomeEn);
    const outHomeFlag = useSelector(getOutHomeFlag);
    const atHomeValidTimes = useSelector(getAtHomeValidTimes) as [Moment, Moment];
    const outHomeValidTimes = useSelector(getOutHomeValidTimes) as [Moment, Moment];
    const add = () => {
        const timer = new TimerTwins('normal');
        timer.invalidtimes = [outHomeFlag ? outHomeValidTimes : [], athomeEn ? atHomeValidTimes : []].filter(twins => twins?.length > 0) as any;
        dispatch(setcurrentTimer(timer));
        history.push('/timer/timerSetting/add')
    }
    return <div className={style.holder}>
        <div>
            <img src={noTimerHolder} alt="" />
            <p>{intl('notimers')}</p>
        </div>
        <button onClick={add}>{intl('timerSetting')}</button>
    </div>
}

export default function TimerList() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory();
    const did = useSelector(getDeviceID);
    const fid = useSelector(getFamilyId);
    const uid = useSelector(getUserId);
    const atHomeValidTimes = useSelector(getAtHomeValidTimes) as [Moment, Moment];
    const outHomeValidTimes = useSelector(getOutHomeValidTimes) as [Moment, Moment];
    useEffect(() => {
        did && uid && fid && dispatch(queryTimer(true))
    }, [dispatch, did, uid, fid]);
    const everydayTimerList = useSelector(getNormalEverydayTimer);
    const periodTimerList = useSelector(getNormalPeriodTimer);
    const [vacationOutHomeTimer] = useSelector(getVacationOutHomeTimer);
    const outHomeTipFlag = useMemo(() => {
        const [start, end] = outHomeValidTimes;
        if (start && end) {
            const now = moment();
            const timeValid = start.isBefore(now) && end.isAfter(now);
            return timeValid && !!vacationOutHomeTimer?.enable
        }
        return !!vacationOutHomeTimer?.enable
    }, [vacationOutHomeTimer, outHomeValidTimes]);
    const vacationTimers = useSelector(getVacationTimer);
    const athomeEnTip = useMemo(() => {
        const [start, end] = atHomeValidTimes;
        if (start && end) {
            const now = moment();
            const timeValid = start.isBefore(now) && end.isAfter(now);
            if (!timeValid) {
                return false
            }
        }
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
    }, [atHomeValidTimes, vacationTimers])
    const hasTimers = useMemo(() => everydayTimerList.length > 0 || periodTimerList.length > 0, [everydayTimerList, periodTimerList])
    const tabType = useSelector(getTimeTabType);
    const athomeEn = useSelector(getAthomeEn);
    const outHomeFlag = useSelector(getOutHomeFlag);
    const add = useCallback(() => {
        if (everydayTimerList.length >= 6 && tabType === 'left') {
            return toast.info('everydayTimerTips')
        }
        if (periodTimerList.length >= 6 && tabType === 'right') {
            return toast.info('weekdayTimerTips')
        }
        const timer = new TimerTwins('normal', { weekdays: tabType === 'left' ? '1234567' : '135' });
        timer.invalidtimes = [outHomeFlag ? outHomeValidTimes : [], athomeEn ? atHomeValidTimes : []].filter(twins => twins?.length > 0) as any;
        dispatch(setcurrentTimer(timer));
        history.push('/timer/timerSetting/add')
    }, [everydayTimerList.length, tabType, periodTimerList.length, outHomeFlag, outHomeValidTimes, athomeEn, atHomeValidTimes, dispatch, history])

    return (
        <Page className={style.mainPage}>
            <Navbar title={intl('timer')} className={style.navbar} />
            {!hasTimers && <TimerPlaceHolder type="notimer" />}
            {hasTimers && <div className={style.timerlistBox}>
                <Tab left={intl('everydayTimer')} right={intl('periodTimer')} curPosition={tabType} onSelect={(type) => dispatch(setTabType(type))} />
                <span className={style.tips}>{outHomeTipFlag || athomeEnTip ? `${outHomeTipFlag ? intl('vacationAwayTimerTips') : intl('vacationHomeTimerTips')}` : ''}</span>
                <div className={style.timerlistContainer}>
                    {tabType === 'left' && everydayTimerList.map((timer, i) => <TimerListBar bottom={everydayTimerList.length > i + 1} key={timer.jobid} timer={timer} />)}
                    {tabType === 'right' && periodTimerList.map((timer, i) => <TimerListBar bottom={periodTimerList.length > i + 1} key={timer.jobid} timer={timer} />)}
                </div>
                <div className={style.button} onClick={add}>{intl('timerSetting')}</div>
            </div>}
        </Page>
    )
}