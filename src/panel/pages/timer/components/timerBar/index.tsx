
import { useFormatMessage } from "@hooks";
import style from './style.module.scss'
import { useCallback, useMemo } from "react";
import { SwipeAction } from 'antd-mobile'
// import { Action, SwipeActionRef } from 'antd-mobile/es/components/swipe-action';
import TimerTwins from "../../timerFactory/Timer";
import { deleteTimer, setcurrentTimer } from "../../timerSlice";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { parseCmd } from "../cmdIntl";
import { upsertTimer } from "../../timerSlice";
import Switcher from "@common/components/Switcher";
import classNames from "classnames";
import { getIsDC } from "@common/root/globalSlice";
import { C2F } from "@common/util";
const TimerListBar = ({ timer, bottom = true }: { timer: TimerTwins, bottom?: boolean }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const intl = useFormatMessage();
    const isDC = useSelector(getIsDC)
    const timeStr = useMemo(() => `${timer.startTimer.moment.format('HH:mm')} - ${timer.endTimer.moment.format('HH:mm')}`, [timer])
    const repeatStr = useMemo(() => {
        let weekday = timer.startTimer.repeat.join('');
        let str = '';
        switch (weekday) {
            case '1234567':
                str = intl('everyday');
                break;
            case '12345':
                str = intl('workday');
                break;
            case '67':
                str = intl('weekday');
                break;
            default:
                str = weekday.split('').map(numStr => intl(`day${numStr}`)).join('、');
                break;
        }
        return str
    }, [timer, intl]);
    const cmdParse = useCallback((cmd) => {
        const parsedIntlArr = parseCmd(cmd as any).map(intlStr => intl(intlStr));
        return parsedIntlArr.length > 1 ? (parsedIntlArr.join('、')) + ` ${isDC ? Math.round((cmd.ac_temp || cmd.hp_hotwater_temp) / 10):C2F((cmd.ac_temp || cmd.hp_hotwater_temp) / 10)}${isDC ? '℃' : '℉'}` : parsedIntlArr[0]
    }, [intl, isDC])
    const cmdStr = useMemo(() => {
        return `${cmdParse(timer.startTimer.cmd)} - ${cmdParse(timer.endTimer.cmd)}`
    }, [timer, cmdParse]);
    const onDelete = () => {
        dispatch(deleteTimer({ id: timer.jobid }))
    }
    const go2Setting = () => {
        dispatch(setcurrentTimer(timer));
        history.push('/timer/timerSetting/edit')
    }
    const toggleTimer = useCallback((en: boolean) => {
        const clone = timer.clone();
        clone.enable = en;
        dispatch(upsertTimer({ timer: clone }))
    }, [timer, dispatch])
    return (
        <SwipeAction rightActions={[{ key: 'delete', text: '删除', color: 'danger', onClick: onDelete as any }]}>
            <div className={classNames(style.cardBox, bottom ? style.bottom : '')} onClick={go2Setting}>
                <div className={style.card}>
                    <div>
                        <span>{timeStr}</span>
                        <p>{cmdStr}</p>
                        <p>{repeatStr}</p>
                    </div>
                    <Switcher on={timer.enable} intimer onChange={toggleTimer} />
                </div>
            </div>
        </SwipeAction>
    )
}

export default TimerListBar