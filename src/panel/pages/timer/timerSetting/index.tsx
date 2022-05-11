import Page from "@components/Page";
import Navbar from "@components/Navbar";
import moment, { Moment } from 'moment';
import { useFormatMessage, useToggle } from "@hooks";
import style from './style.module.scss'
import {
    useDispatch, useSelector,
} from "react-redux";
import { useHistory, useParams } from "react-router";
import FunctionBar from "../../main/FunctionBar";
import { useMemo, useCallback } from "react";
import TxtArrow from "@common/components/TxtArrow";
import { setcurrentTimer, upsertTimer, deleteTimer, getCurrentTimer } from "../timerSlice";
import TimePicker from "@common/components/TimePicker";
import Popup from "@common/components/popup";
import { parseCmd } from "../components/cmdIntl";
import toast from '@components/Toast'
import { getIsDC } from "@common/root/globalSlice";
import { C2F, M1IsTimeBeforeM2 } from "@common/util";

export default function Mute() {
    const intl = useFormatMessage();
    const history = useHistory();
    const dispatch = useDispatch();
    const currentTimer = useSelector(getCurrentTimer);
    const isDC = useSelector(getIsDC);
    const { type } = useParams() as { type: 'add' | 'edit' };
    const onSave = useCallback(() => {
        if (!M1IsTimeBeforeM2(currentTimer.startTimer.moment, currentTimer.endTimer.moment)) {
            return toast.info(intl('timerTip'));
        }
        dispatch(upsertTimer({ callback: () => history.goBack() }))
    }, [currentTimer.endTimer.moment, currentTimer.startTimer.moment, dispatch, history, intl])

    const jump2Interval = useCallback((type: 'start' | 'end') => {
        history.push(`/timer/cmdSetting/${type}`)
    }, [history])

    const [startTimeShow, toggleStart] = useToggle(false);
    const [endTimeShow, toggleEnd] = useToggle(false);
    const onCancel = () => {
        toggleStart(false);
        toggleEnd(false);
    }
    const onCertain = (type: 'start' | 'end') => {
        onCancel()
    }
    const repeatStr = useMemo(() => {
        let weekday = currentTimer.startTimer.repeat.join('');
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
    }, [currentTimer, intl]);

    const cmdParse = useCallback((cmd) => {
        const parsedIntlArr = parseCmd(cmd as any).map(intlStr => intl(intlStr));
        return parsedIntlArr.length > 1 ? (parsedIntlArr.join('、')) + ` ${isDC ? Math.round((cmd.ac_temp || cmd.hp_hotwater_temp) / 10) : C2F((cmd.ac_temp || cmd.hp_hotwater_temp) / 10)}${isDC ? '℃' : '℉'}` : parsedIntlArr[0]
    }, [intl, isDC])
    const cmdStr = useMemo(() => {
        return [cmdParse(currentTimer.startTimer.cmd), cmdParse(currentTimer.endTimer.cmd)]
    }, [currentTimer, cmdParse]);

    const changeTime = useCallback((time: Moment, type: 'start' | 'end') => {
        const clone = currentTimer.clone();
        const _time = time.second(moment().second())
        switch (type) {
            case 'start':
                clone.startTimer.moment = _time;
                break;
            case 'end':
                clone.endTimer.moment = _time;
                break;
            default:
                clone.startTimer.moment = _time;
                break;
        }
        dispatch(setcurrentTimer(clone))
    }, [currentTimer, dispatch]);
    const onDelete = () => {
        dispatch(deleteTimer({ id: currentTimer.jobid, callback: () => history.goBack() }))
    }
    return (
        <Page className={style.mutePage}>
            <Navbar title={intl(type === 'add' ? 'timerSetting' : 'timerEdit')} className={style.navbar} save={{ name: intl("save"), onSave }} />
            <div className={style.cmdBox}>
                <div className={style.ecoFun}>
                    <FunctionBar title={intl('repeat')} onClick={() => history.push('/timer/repeatSetting')}><TxtArrow title={repeatStr} /></FunctionBar>

                    <FunctionBar title={intl('startTime')} onClick={toggleStart}><TxtArrow title={currentTimer.startTimer.moment.format('HH:mm')} /></FunctionBar>
                    <FunctionBar title={intl('startCmd')} onClick={() => jump2Interval('start')}><TxtArrow title={cmdStr[0]} /></FunctionBar>

                    <FunctionBar title={intl('endTime')} onClick={toggleEnd}><TxtArrow title={currentTimer.endTimer.moment.format('HH:mm')} /></FunctionBar>
                    <FunctionBar title={intl('endCmd')} onClick={() => jump2Interval('end')}><TxtArrow title={cmdStr[1]} /></FunctionBar>
                </div>
                {type === 'edit' && <div className={style.button} onClick={onDelete}>{intl('delete')}</div>}
            </div>
            <Popup show={startTimeShow} onCancel={onCancel} onSave={() => onCertain('start')} title={intl('startTime')} >
                <TimePicker defaultValue={currentTimer.startTimer.moment} onChange={(time: Moment) => changeTime(time, 'start')} />
            </Popup>
            <Popup show={endTimeShow} onCancel={onCancel} onSave={() => onCertain('end')} title={intl('endTime')} >
                <TimePicker defaultValue={currentTimer.endTimer.moment} onChange={(time: Moment) => changeTime(time, 'end')} />
            </Popup>
        </Page>
    )
}