import Page from "@components/Page";
import Navbar from "@components/Navbar";
import { useFormatMessage } from "@hooks";
import { useParams } from "react-router-dom";
import moment, { Moment } from 'moment';
import style from './style.module.scss'
import {
    useDispatch, useSelector,
} from "react-redux";
import { useHistory } from "react-router";
import classNames from "classnames";
import { upsertTimer, getAtHomeValidTimes, getOutHomeValidTimes, getCurrentTimer, setcurrentTimer, batchesUpdateTimers, getNormalTimer, getVacationTimer } from "@panel/pages/timer/timerSlice";
import { useCallback, useMemo, useState } from "react";
import { DatePickerView } from 'antd-mobile'
import './DatePickerView.css';
import toast from '@components/Toast'



function TimeSelect({ onClick, select, start, end }: { onClick: (val: 'stime' | 'etime') => void, select: string, start?: Moment, end?: Moment }) {
    const currentTimer = useSelector(getCurrentTimer);
    const { timesType } = useParams() as { timesType: 'athome' | 'outhome' };
    const atHomeValidTimes = useSelector(getAtHomeValidTimes);
    // const outHomeValidTimes = useSelector(getOutHomeValidTimes);
    const [stime, etime] = useMemo(() => timesType === 'athome' ? atHomeValidTimes : [currentTimer?.startTimer?.moment, currentTimer?.endTimer?.moment], [timesType, atHomeValidTimes, currentTimer])
    const intl = useFormatMessage();
    return (
        <div className={style.tab}>
            <ul>
                <li className={classNames({ [style.active]: select === 'stime' })} onClick={() => onClick('stime')} >
                    <p>{intl('startTime')}</p>
                    <span>{(start || stime).format('YYYY-MM-DD')}</span>
                </li>
                <li className={classNames({ [style.active]: select === 'etime' })} onClick={() => onClick('etime')}>
                    <p>{intl('endTime')}</p>
                    <span>{(end || etime).format('YYYY-MM-DD')}</span>
                </li>
            </ul>
        </div>
    )

}
export default function ValidPeriod() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory();
    const currentTimer = useSelector(getCurrentTimer);
    const { timesType } = useParams() as { timesType: 'athome' | 'outhome' };
    const atHomeValidTimes = useSelector(getAtHomeValidTimes);
    const outHomeValidTimes = useSelector(getOutHomeValidTimes);
    const normalTimer = useSelector(getNormalTimer);
    const vacationTimer = useSelector(getVacationTimer);
    const [stime, etime] = useMemo(() => timesType === 'athome' ? atHomeValidTimes : [currentTimer?.startTimer?.moment, currentTimer?.endTimer?.moment], [timesType, atHomeValidTimes, currentTimer])
    const [select, setSeclect] = useState('stime' as 'stime' | 'etime');
    const chooseTimeType = (val: 'stime' | 'etime') => {
        if (val === select) return;
        setSeclect(val);
    }
    const [athomeStart, setAthomeStart] = useState(stime);
    const [athomeEnd, setAthomeEnd] = useState(etime);
    const [outhomeStart, setOuthomeStart] = useState(stime);
    const [outhomeEnd, setOuthomeEnd] = useState(etime);


    const labelRenderer = useCallback((type: string, data: number) => {
        switch (type) {
            case 'year':
                return data + ''
            case 'month':
                return data < 10 ? `0${data}` : data
            case 'day':
                return data < 10 ? `0${data}` : data
            case 'hour':
                return data + '时'
            case 'minute':
                return data + '分'
            case 'second':
                return data + '秒'
            default:
                return data
        }
    }, [])
    const onSave = useCallback(() => {
        const todayEnd = moment().hour(23).minute(59).second(59);
        if (timesType === 'athome') {//度假在家
            const [atHomeS] = atHomeValidTimes;
            if (!atHomeS.isSame(athomeStart, 'day') && athomeStart.isBefore(todayEnd)) {//修改在家开始时间且开始时间晚于当天
                return toast.info('startTimeShouldAfterToday');
            }
        } else {//度假离家
            const [outHomeS] = outHomeValidTimes;
            if (!outHomeS.isSame(outhomeStart, 'day') && outhomeStart.isBefore(todayEnd)) {//修改离家开始时间且开始时间晚于当天
                return toast.info('startTimeShouldAfterToday');
            }
        }
        if (currentTimer.startTimer.moment.isAfter(currentTimer.endTimer.moment, 'day')) {
            return toast.info(intl('timerTip'));
        }
        if (athomeStart.isAfter(athomeEnd, 'day')) {
            return toast.info(intl('timerTip'));
        }
        if (timesType === 'athome') {//批量更新,更新normal，更新vacation
            if (atHomeValidTimes[0]?.format('YYYY-MM-DD') !== athomeStart?.format('YYYY-MM-DD') ||
                atHomeValidTimes[1]?.format('YYYY-MM-DD') !== athomeEnd?.format('YYYY-MM-DD')) {//批量更新时间
                let normalInvalidtimes = [[athomeStart, athomeEnd]];
                if (outHomeValidTimes.length > 0) {
                    normalInvalidtimes.unshift(outHomeValidTimes)
                }
                if (normalTimer.length > 0) {
                    dispatch(batchesUpdateTimers({
                        attributes: [{
                            name: 'invalidtimes',
                            value: normalInvalidtimes
                        }], timerType: 'normal'
                    }))
                }
                if (vacationTimer.length > 0) {
                    dispatch(batchesUpdateTimers({
                        attributes: [{
                            name: 'validtimes',
                            value: [[athomeStart, athomeEnd]]
                        }],
                        timerType: 'vacation'
                    }))
                }
            }
            history.goBack()
        } else {
            dispatch(upsertTimer({ callback: () => history.goBack() }))
        }
    }, [currentTimer, timesType, dispatch, history, athomeStart, athomeEnd, atHomeValidTimes, outHomeValidTimes, vacationTimer, normalTimer, intl, outhomeStart])

    const onChange = useCallback((value: Date, type: 'stime' | 'etime') => {

        const [stime, etime] = [moment(value).hour(0).minute(0), moment(value).hour(23).minute(59)];
        console.log('value----', moment(value).hour(0).minute(0));
        if (timesType === 'athome') {//在家
            switch (type) {
                case 'stime':
                    setAthomeStart(stime)
                    break;
                case 'etime':
                    setAthomeEnd(etime)
                    break;
                default:
                    setAthomeStart(stime)
                    break;
            }
        } else {//离家
            const clone = currentTimer.clone();
            const [[valid1, valid2]] = clone.validtimes;
            switch (type) {
                case 'stime':
                    clone.startTimer.moment = stime;
                    setOuthomeStart(stime)
                    clone.validtimes = [[stime, moment(valid2)]];
                    break;
                case 'etime':
                    clone.endTimer.moment = etime;
                    setOuthomeEnd(etime)
                    clone.validtimes = [[moment(valid1), etime]];
                    break;
                default:
                    clone.startTimer.moment = stime;
                    clone.validtimes = [[stime, moment(valid2)]];
                    break;
            }
            dispatch(setcurrentTimer(clone))
        }

    }, [currentTimer, dispatch, timesType]);


    return (
        <Page className={style.mainPage}>
            <Navbar title={intl('ValidPeriod')} className={style.navbar} save={{ name: intl('save'), onSave }} />
            <div className={style.interval}>
                {timesType === 'athome' && <TimeSelect start={athomeStart} end={athomeEnd} onClick={(val: 'stime' | 'etime') => chooseTimeType(val)} select={select} />}
                {timesType === 'outhome' && <TimeSelect onClick={(val: 'stime' | 'etime') => chooseTimeType(val)} select={select} />}
                <div className={style.timeView}>
                    {select === 'stime' && <DatePickerView defaultValue={new Date((timesType === 'athome' ? athomeStart : outhomeStart).format('YYYY-MM-DD'))} precision='day' renderLabel={labelRenderer} onChange={(value: Date) => onChange(value, 'stime')} />}
                    {select === 'etime' && <DatePickerView defaultValue={new Date((timesType === 'athome' ? athomeEnd : outhomeEnd).format('YYYY-MM-DD'))} precision='day' renderLabel={labelRenderer} onChange={(value: Date) => onChange(value, 'etime')} />}
                    <div className={style.label}><p>-</p><p>-</p></div>
                </div>
            </div>
        </Page>
    )
}