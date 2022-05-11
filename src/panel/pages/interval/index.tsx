/*
 * @Author: ajie.deng
 * @Date: 2022-03-07 10:23:38
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 14:44:47
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\interval\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import moment, { Moment } from 'moment';
import { useDispatch, useSelector } from "react-redux";
import Navbar from "@common/components/Navbar";
import Page from "@common/components/Page";
import TimePicker from "@common/components/TimePicker";
import { useFormatMessage } from "@common/hooks";
import { getCurrentTimer, setcurrentTimer, upsertTimer } from "../timer/timerSlice";
import toast from '@components/Toast'


import style from './style.module.scss';
import classNames from "classnames";

function TimeSelect({ onClick, select }: { onClick: (val: string) => void, select: string }) {
    const currentTimer = useSelector(getCurrentTimer);
    const intl = useFormatMessage();
    return (
        <div className={style.tab}>
            <ul>
                <li className={classNames({ [style.active]: select === 'stime' })} onClick={() => onClick('stime')} >
                    <p>{intl('startTime')}</p>
                    <span>{currentTimer.startTimer.moment.format('HH:mm')}</span>
                </li>
                <li className={classNames({ [style.active]: select === 'etime' })} onClick={() => onClick('etime')}>
                    <p>{intl('endTime')}</p>
                    <span>{currentTimer.endTimer.moment.format('HH:mm')}</span>
                </li>
            </ul>
        </div>
    )

}
export default function TimeInterval() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory();
    const currentTimer = useSelector(getCurrentTimer);
    const [select, setSeclect] = useState('stime');

    const chooseTimeType = (val: string) => {
        if (val === select) return;
        setSeclect(val);
    }
    const onSave = useCallback(() => {
        const [sH,sM] = [currentTimer.startTimer.moment.hour(),currentTimer.startTimer.moment.minute()];
        const [eH,eM] = [currentTimer.endTimer.moment.hour(),currentTimer.endTimer.moment.minute()]
        const now = moment();
        if (!now.clone().hour(sH).minute(sM).isBefore(now.clone().hour(eH).minute(eM))) {
            return toast.info(intl('timerTip'));
        }
        dispatch(upsertTimer({ callback: () => history.goBack() }))
    }, [currentTimer.endTimer.moment, currentTimer.startTimer.moment, dispatch, history, intl])
    const changeTime = useCallback((time: Moment, type: 'stime' | 'etime') => {
        const clone = currentTimer.clone();
        const _time = time.second(moment().second())
        console.log('--------_time-----',_time)
        switch (type) {
            case 'stime':
                clone.startTimer.moment = _time;
                break;
            case 'etime':
                clone.endTimer.moment = _time;
                break;
            default:
                clone.startTimer.moment = _time;
                break;
        }
        dispatch(setcurrentTimer(clone))
    }, [currentTimer, dispatch]);

    return (
        <Page className={style.intervalPage}>
            <Navbar title={intl('TimeInterval')} className={style.intervalnavbar} save={{ name: intl('save'), onSave }} />
            <div className={style.interval}>
                <TimeSelect onClick={(val: string) => chooseTimeType(val)} select={select} />
                {select === 'stime' && <TimePicker onChange={(stime: Moment) => changeTime(stime, 'stime')} defaultValue={currentTimer.startTimer.moment} />}
                {select === 'etime' && <TimePicker onChange={(etime: Moment) => changeTime(etime, 'etime')} defaultValue={currentTimer.endTimer.moment} />}
            </div>
        </Page>
    )
}