/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 14:15:02
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\timer\customRepeat\index.tsx
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
import { useCallback, useMemo } from "react";
import { getCurrentTimer, setcurrentTimer, upsertTimer } from "../timerSlice";
import select from '@img/_select.svg';
import noselect from '@img/noselect.svg';
import toast from '@components/Toast';
import { useHistory } from "react-router-dom";

export default function CustomRepeat() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory()
    const currentTimer = useSelector(getCurrentTimer);

    const list = useMemo(() => [
        intl('day1'),
        intl('day2'),
        intl('day3'),
        intl('day4'),
        intl('day5'),
        intl('day6'),
        intl('day7')
    ], [intl])
    const sort = useCallback((a, b) => a - b, []);
    const onSelect = useCallback((j: number) => {
        const clone = currentTimer.clone();
        let repeat = clone.startTimer.repeat;
        if (repeat.length === 1 && repeat.includes(j + 1)) {
            return toast.info('repeatNeedAtLeastOne');
        }
        if (repeat.includes(j + 1)) {
            repeat = repeat.filter(numStr => numStr !== Number(j + 1))
        } else {
            repeat.push(j + 1);
        }
        repeat.sort(sort);
        clone.startTimer.repeat = repeat;
        clone.endTimer.repeat = repeat;
        dispatch(setcurrentTimer(clone));
    }, [currentTimer, dispatch, sort])
    const onSave = useCallback(() => {
        dispatch(upsertTimer({ callback: () => history.goBack() }))
    }, [dispatch, history])
    return (
        <Page className={style.mainPage}>
            <Navbar title={intl('repeat')} className={style.navbar} save={{ name: intl("save"), onSave }} />
            <div className={style.CustomRepeat}>
                <ul>
                    {
                        list.map((i, j) => {
                            return (
                                <li key={j} onClick={() => onSelect(j)}>
                                    <p>{i} </p>
                                    <div><img src={currentTimer?.startTimer?.repeat?.includes(j + 1) ? select : noselect} alt="" /></div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </Page>
    )
}