/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 16:49:17
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\mute\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import Page from "@components/Page";
import Navbar from "@components/Navbar";
import TimerTwins from "../timer/timerFactory/Timer";
import { useDevState, useFormatMessage, useToggle } from "@hooks";
import style from './style.module.scss'
import {
    useDispatch, useSelector,
} from "react-redux";
import { useHistory } from "react-router";
import FunctionBar from "../main/FunctionBar";
import Switcher from "@common/components/Switcher";
import { useMemo, useCallback } from "react";
import TxtArrow from "@common/components/TxtArrow";
import { control } from "@common/root/logic";
import { getMuteTimer, getVacationOutHomeTimer, setcurrentTimer, upsertTimer } from "../timer/timerSlice";
import toast from '@components/Toast';
import Alert from "@common/components/Alert";

export default function Mute() {
    const intl = useFormatMessage();
    const history = useHistory();
    const dispatch = useDispatch();
    const [showOutHome, toggleOutHome] = useToggle(false);
    const [vacationOutHomeTimer] = useSelector(getVacationOutHomeTimer);
    const outHomeFlag = useMemo(() => !!vacationOutHomeTimer?.enable, [vacationOutHomeTimer]);
    const [muteTimer1, muteTimer2] = useSelector(getMuteTimer);
    const interval = useMemo(() => {
        let interval1 = '12:00-15:00', interval2 = '19:00-23:00';
        if (muteTimer1?.startTimer) {
            interval1 = `${muteTimer1.startTimer.moment.format('HH:mm')}-${muteTimer1.endTimer.moment.format('HH:mm')}`
        }
        if (muteTimer2?.startTimer) {
            interval2 = `${muteTimer2.startTimer.moment.format('HH:mm')}-${muteTimer2.endTimer.moment.format('HH:mm')}`
        }
        return [interval1, interval2]
    }, [muteTimer1, muteTimer2])
    const { qtmode, hp_pwr, ac_pwr } = useDevState();
    const toggleMute = () => {
        if (!ac_pwr && !hp_pwr && qtmode === 0) {
            return toast.info('turnOnTips')
        }
        if (outHomeFlag && qtmode === 0) {//暂时屏蔽静音在离家开启的互斥
            // return toggleOutHome()
        }

        control({ 'qtmode': qtmode ? 0 : 1 })
    }
    const toggleMuteTimer = (en: boolean, type: 'mute1' | 'mute2') => {
        if (!ac_pwr && !hp_pwr && en) {
            return toast.info('turnOnTips')
        }
        const _muteTimer = (type === 'mute1' ? muteTimer1 : muteTimer2)?.clone() || new TimerTwins(type);
        _muteTimer.enable = en;
        dispatch(upsertTimer({ timer: _muteTimer }))
    }

    const jump2Interval = useCallback((type: 'mute1' | 'mute2') => {
        dispatch(setcurrentTimer(type === 'mute1' ? (muteTimer1 || new TimerTwins(type)) : (muteTimer2 || new TimerTwins(type))));
        history.push('/interval');
    }, [muteTimer1, muteTimer2, dispatch, history])

    const cancelVacationOutHome = useCallback(() => {
        const _vacationOutHomeTimer = vacationOutHomeTimer?.clone();
        _vacationOutHomeTimer.enable = false;
        dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))
        toggleOutHome();
    }, [vacationOutHomeTimer, dispatch, toggleOutHome]);
    return (
        <Page className={style.mutePage}>
            <Navbar title={intl('mute')} className={style.econavbar} />
            <div className={style.ecoFun}>
                <FunctionBar  title={intl('mute')}><Switcher intimer on={qtmode} onChange={toggleMute} /></FunctionBar>

                <FunctionBar  title={intl('muteTimer1')}><Switcher intimer on={muteTimer1?.enable} onChange={(en) => toggleMuteTimer(en, 'mute1')} /></FunctionBar>
                <FunctionBar  title={intl('TimeInterval')} onClick={() => jump2Interval('mute1')}><TxtArrow title={interval[0]} /></FunctionBar>

                <FunctionBar  title={intl('muteTimer2')}><Switcher intimer on={muteTimer2?.enable} onChange={(en) => toggleMuteTimer(en, 'mute2')} /></FunctionBar>
                <FunctionBar  title={intl('TimeInterval')} onClick={() => jump2Interval('mute2')}><TxtArrow title={interval[1]} /></FunctionBar>
            </div>
            <Alert title={intl('needCloseVacation')} show={showOutHome} onCancel={toggleOutHome} onCertain={cancelVacationOutHome} />

        </Page>
    )
}