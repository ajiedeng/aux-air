/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 16:48:57
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\eco\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import Page from "@components/Page";
import Navbar from "@components/Navbar";
import { useDevState, useFormatMessage, useToggle } from "@hooks";
import style from './style.module.scss'
import {
    useDispatch, useSelector,
} from "react-redux";
import moment, { Moment } from "moment";
import { useHistory } from "react-router";
import FunctionBar from "../main/FunctionBar";
import Switcher from "@common/components/Switcher";
import TxtArrow from "@common/components/TxtArrow";
import { control } from "@common/root/logic";
import { useCallback, useMemo } from "react";
import { getEcoTimer, getOutHomeFlag, getOutHomeValidTimes } from "../timer/timerSlice";
import { setcurrentTimer, upsertTimer, getVacationOutHomeTimer } from "../timer/timerSlice";
import TimerTwins from "../timer/timerFactory/Timer";
import Alert from "@common/components/Alert";
import toast from '@components/Toast'
export default function ECO() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const [ecoTimer] = useSelector(getEcoTimer);
    const [showAlert, toggleAlert] = useToggle(false);
    const [showOutHome, toggleOutHome] = useToggle(false);
    const [vacationOutHomeTimer] = useSelector(getVacationOutHomeTimer);
    const outHomeFlag = useMemo(() => (!!vacationOutHomeTimer?.enable && vacationOutHomeTimer?.startTimer.moment.isBefore(moment()) && vacationOutHomeTimer?.endTimer.moment.isAfter(moment())), [vacationOutHomeTimer]);

    const timeStr = useMemo(() => {
        if (ecoTimer?.startTimer) {
            return `${ecoTimer.startTimer.moment.format('HH:mm')}-${ecoTimer.endTimer.moment.format('HH:mm')}`
        } else {
            return '08:00-19:00'
        }
    }, [ecoTimer])
    const history = useHistory();
    const { ecomode, hp_auto_wtemp, ac_pwr } = useDevState();
    const toggleEco = () => {
        if (!ac_pwr && ecomode === 0) {
            return toast.info('turnOnTips')
        }
        if (outHomeFlag && ecomode === 0) {
            return toggleOutHome()
        }
        if (hp_auto_wtemp && ecomode === 0) {
            return toggleAlert();
        }

        control({ 'ecomode': ecomode ? 0 : 1 })
    }
    const cancelWtemp = () => {
        toggleAlert();
        control({ 'ecomode': ecomode ? 0 : 1, 'hp_auto_wtemp': 0 })
    }
    const outHomeValidTimes = useSelector(getOutHomeValidTimes) as [Moment, Moment];

    const _outHomeFlag = useSelector(getOutHomeFlag);

    const toggleEcoTimer = (en: boolean) => {
        if (!ac_pwr && en) {
            return toast.info('turnOnTips')
        }
        const _ecoTimer = ecoTimer?.clone() || new TimerTwins('eco');
        _ecoTimer.enable = en;
        _ecoTimer.invalidtimes = [_outHomeFlag ? outHomeValidTimes : []].filter(twins => twins?.length > 0) as any;

        dispatch(upsertTimer({ timer: _ecoTimer }))
    }
    const jump2Interval = useCallback(() => {
        dispatch(setcurrentTimer(ecoTimer || new TimerTwins('eco')));
        history.push('/interval');
    }, [ecoTimer, dispatch, history])

    const cancelVacationOutHome = useCallback(() => {
        const _vacationOutHomeTimer = vacationOutHomeTimer?.clone();
        _vacationOutHomeTimer.enable = false;
        dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))
        toggleOutHome();
    }, [vacationOutHomeTimer, dispatch, toggleOutHome]);
    return (
        <Page className={style.ecoPage}>
            <Navbar title={intl('eco')} className={style.econavbar} />
            <div className={style.ecoFun}>
                <FunctionBar title={intl('eco')}><Switcher intimer on={ecomode} onChange={toggleEco} /></FunctionBar>
                <FunctionBar title={intl('ecoTimer')}><Switcher intimer on={!!ecoTimer?.enable} onChange={toggleEcoTimer} /></FunctionBar>
                <FunctionBar title={intl('TimeInterval')} onClick={jump2Interval}><TxtArrow title={timeStr} /></FunctionBar>
            </div>
            <Alert title={intl('needCloseVacation')} show={showOutHome} onCancel={toggleOutHome} onCertain={cancelVacationOutHome} />
            <Alert title={intl('autoWaterTempTips')} show={showAlert} onCancel={toggleAlert} onCertain={cancelWtemp} />
        </Page>
    )
}