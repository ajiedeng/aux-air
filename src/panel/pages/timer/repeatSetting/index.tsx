/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 14:15:47
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\timer\repeatSetting\index.tsx
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
import { useMemo } from "react";
import { getCurrentTimer, setcurrentTimer } from "../timerSlice";

import select from '@img/select.svg'

export default function RepeatSetting() {
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const history = useHistory();
    const currentTimer = useSelector(getCurrentTimer);

    const list = useMemo(() => [
        { text: intl('everyday') },
        { text: intl('workday'), note: intl('_worknote') },
        { text: intl('weekday'), note: intl('_weeknote') },
        { text: intl('custom') }
    ], [intl])
    const selected = useMemo(() => {
        let weekday = currentTimer.startTimer.repeat.join('');
        let _select: number = 0;
        switch (weekday) {
            case '1234567':
                _select = 0;
                break;
            case '12345':
                _select = 1;
                break;
            case '67':
                _select = 2;
                break;
            default:
                _select = 3;
                break;
        }
        return _select
    }, [currentTimer]);
    const onSelect = (j: number) => {
        if (j === 3) {
            return history.push('/timer/customRepeat')
        }
        if (j === selected) return;
        const clone = currentTimer.clone();
        switch (j) {
            case 0:
                clone.startTimer.repeat = [1, 2, 3, 4, 5, 6, 7];
                clone.endTimer.repeat = [1, 2, 3, 4, 5, 6, 7];
                break;
            case 1:
                clone.startTimer.repeat = [1, 2, 3, 4, 5];
                clone.endTimer.repeat = [1, 2, 3, 4, 5];
                break;
            case 2:
                clone.startTimer.repeat = [6, 7];
                clone.endTimer.repeat = [6, 7];
                break;
            default:
                break;
        }
        dispatch(setcurrentTimer(clone));
    }

    return (
        <Page className={style.repeatSetting}>
            <Navbar title={intl('repeat')} className={style.navbar} />
            <div className={style.repeatList}>
                <ul>
                    {
                        list.map((i, j) => {
                            return (
                                <li key={j} onClick={() => onSelect(j)}>
                                    <p>{i.text} {i.note ? <span>{i.note}</span> : null}</p>
                                    <div>{selected === j ? <img src={select} alt="" /> : null}</div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </Page>
    )
}