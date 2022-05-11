import Page from "@components/Page";
import Navbar from "@components/Navbar";
import { useFormatMessage } from "@hooks";
import style from './style.module.scss'
import {
    useDispatch, useSelector,
} from "react-redux";
import React, { useCallback, useMemo } from "react";
import { getCurrentTimer, setcurrentTimer, upsertTimer } from "../timerSlice";
import { useHistory, useParams } from "react-router-dom";
import sel from '@img/sel.svg';
import noselect from '@img/noselect.svg';
import add from '@img/add.svg';
import reduce from '@img/reduce.svg';

import cold from '@img/cold.svg';
import hot from '@img/hot.svg';
import hotwater from '@img/hotwater.svg';
import coldOn from '@img/cold_on.svg';
import hotOn from '@img/hot_on.svg';
import hotwaterOn from '@img/hotwater_on.svg';
import toast from '@components/Toast';

import classNames from "classnames";
import { getIsDC } from "@common/root/globalSlice";
import { C2F, F2C } from "@common/util";



function FunItem({ name, checked, onClick }: { name: string, checked: boolean, onClick: () => void }) {
    return (
        <div className={style.FunItem} onClick={onClick}>
            <span>{name}</span> <div><img src={checked ? sel : noselect} alt="" /></div>
        </div>
    )
}

export default function CmdSetting() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory();
    const isDC = useSelector(getIsDC);
    const { timeType } = useParams() as { timeType: 'start' | 'end' };
    const currentTimer = useSelector(getCurrentTimer);
    const timer = useMemo(() => timeType === 'start' ? currentTimer.startTimer : currentTimer.endTimer, [currentTimer, timeType]);
    const airArr = useMemo(() => {
        return [
            { name: intl('cold'), type: 'cold', tempRange: [50, 250], icon: cold, disable: timer.cmd.hp_pwr === 1, iconOn: coldOn, checked: timer.cmd.ac_mode === 1 },
            { name: intl('hot'), type: 'hot', tempRange: [250, 650], icon: hot, disable: timer.cmd.hp_pwr === 1, iconOn: hotOn, checked: timer.cmd.ac_mode === 4 },
            { name: intl('wh'), type: 'hotwater', tempRange: [300, 600], icon: hotwater, disable: timer.cmd.ac_pwr === 1, iconOn: hotwaterOn, checked: timer.cmd.hp_fast_hotwater === 1 }
        ]
    }, [intl, timer]);
    const curModeConfig = useMemo(() => {
        return airArr.find(mode => mode.checked) || airArr[0];
    }, [airArr])
    const funOptions = useMemo(() => {
        return [
            { text: intl('openAir'), type: 'openAir', checked: timer.cmd.ac_pwr === 1 },
            { text: intl('openWh'), type: 'openWh', checked: timer.cmd.hp_pwr === 1 },
            { text: intl('closeAir'), type: 'closeAir', checked: timer.cmd.ac_pwr === 0 },
            { text: intl('closeWh'), type: 'closeWh', checked: timer.cmd.hp_pwr === 0 }
        ] as { text: string, checked: boolean, type: 'openAir' | 'openWh' | 'closeAir' | 'closeWh' }[]
    }, [intl, timer])
    const onSelectTab = (fun: { text: string, checked: boolean, type: 'openAir' | 'openWh' | 'closeAir' | 'closeWh' }) => {
        if (fun.checked) return;
        const clone = currentTimer.clone();
        const timer = timeType === 'start' ? clone.startTimer : clone.endTimer;
        switch (fun.type) {
            case 'openAir':
                timer.cmd = { ac_pwr: 1, ac_mode: 1, ac_temp: 70 }
                break;
            case 'openWh':
                timer.cmd = { hp_pwr: 1, hp_fast_hotwater: 1, hp_hotwater_temp: 550 }
                break;
            case 'closeAir':
                timer.cmd = { ac_pwr: 0 }
                break;
            case 'closeWh':
                timer.cmd = { hp_pwr: 0 }
                break;
            default:
                break;
        }
        dispatch(setcurrentTimer(clone));
    }

    const onSelectMode = (fun: { name: string, disable: boolean, checked: boolean, type: 'hotwater' | 'cold' | 'hot' }) => {
        if (fun.checked || fun.disable) return;
        const clone = currentTimer.clone();
        const timer = timeType === 'start' ? clone.startTimer : clone.endTimer;
        switch (fun.type) {
            case 'cold':
                Object.assign(timer.cmd, { ac_mode: 1, ac_temp: 70 })
                break;
            case 'hot':
                Object.assign(timer.cmd, { ac_mode: 4, ac_temp: 450 })
                break;
            case 'hotwater':
                timer.cmd = { hp_fast_hotwater: 1, hp_hotwater_temp: 550 }
                break;
            default:
                break;
        }
        dispatch(setcurrentTimer(clone));
    }
    const boundary = useCallback((b: number) => {
        return isDC ? b : C2F(b)
    }, [isDC])

    const temp2DC = useCallback((t: number) => {
        return isDC ? Math.round(t * 10) : F2C(t)
    }, [isDC])

    const changeTemp = useCallback((num) => {
        const { type, tempRange } = curModeConfig;
        const _curTemp = type === 'hotwater' ? timer.cmd.hp_hotwater_temp : timer.cmd.ac_temp;
        const curTemp = isDC ? Math.round(Number(_curTemp) / 10) : C2F(Number(_curTemp) / 10);
        let _temp = curTemp + num;
        if (_temp < boundary(tempRange[0] / 10)) {
            return toast.info(`Minimum`)
        }
        if (_temp > boundary(tempRange[1] / 10)) {
            return toast.info(`Maximum`)
        }
        const clone = currentTimer.clone();
        const _timer = timeType === 'start' ? clone.startTimer : clone.endTimer;
        type === 'hotwater' ? (_timer.cmd.hp_hotwater_temp = temp2DC(_temp)) : (_timer.cmd.ac_temp = temp2DC(_temp));
        dispatch(setcurrentTimer(clone));
    }, [curModeConfig, timer.cmd.hp_hotwater_temp, timer.cmd.ac_temp, isDC, boundary, currentTimer, timeType, temp2DC, dispatch])
    const onSave = useCallback(() => {
        dispatch(upsertTimer({ callback: () => history.goBack() }))
    }, [dispatch, history])
    return (
        <Page className={style.cmdSetting}>
            <Navbar title={intl('cmdSetting')} className={style.navbar} save={{ name: intl("save"), onSave }} />
            <div className={style.funOptions}>
                {
                    funOptions.map((fun, j) => <FunItem key={j} name={fun.text} checked={fun.checked ? true : false} onClick={() => onSelectTab(fun)} />)

                }
            </div>
            {!!(timer.cmd.ac_pwr || timer.cmd.hp_pwr) &&
                <React.Fragment>
                    <div className={style.airSetting}>
                        <ul>
                            {
                                airArr.map((item, index) => {
                                    return (
                                        <li key={index} onClick={() => onSelectMode(item as any)} className={classNames({ [style.active]: item.checked, [style.disable]: item.disable })}>
                                            <div><img src={item.checked ? item.iconOn : item.icon} alt="" /></div>
                                            <p>{item.name}</p>
                                        </li>
                                    )
                                })
                            }

                        </ul>
                    </div>
                    <div className={style.tempSetting}>
                        <div onClick={() => changeTemp(-1)}><img src={reduce} alt="" /></div>

                        <div><p>{`${isDC ? Math.round(Number(timer.cmd.ac_pwr ? timer.cmd.ac_temp : timer.cmd.hp_hotwater_temp) / 10) : C2F(Number(timer.cmd.ac_pwr ? timer.cmd.ac_temp : timer.cmd.hp_hotwater_temp) / 10)}${isDC ? '℃' : '℉'}`}</p>{intl('tempSetting')}</div>
                        <div onClick={() => changeTemp(1)}><img src={add} alt="" /></div>
                    </div>
                </React.Fragment>}
        </Page>
    )
}