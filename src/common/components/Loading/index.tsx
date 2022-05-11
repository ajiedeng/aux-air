/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 17:32:14
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\common\components\Loading\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    // useDispatch ,
    useSelector
} from 'react-redux';
import ReactDOM from 'react-dom';
import style from './style.module.scss'
import loading from './img/loading.svg';
// import classNames from 'classnames';
// import { CSSTransition } from 'react-transition-group';

//渲染挂载dom元素对象
let ModalRoot: any, LoadingContainer: any;
ModalRoot = document.createElement('div');
document.body.appendChild(ModalRoot);
LoadingContainer = document.createElement('div');

export default function Loading({txt='加载中'}:{txt?:string}) {
    const [isShow, setisShow] = useState(false);
    const timeout: any = useRef(null);
    const top = useSelector((state: any) => state.global.statusBarHeight);
    useEffect(() => {
        ModalRoot.appendChild(LoadingContainer);
        timeout.current = setTimeout(() => setisShow(true), 500);
        return () => {
            ModalRoot.removeChild(LoadingContainer);
            clearTimeout(timeout.current);
        }
    }, [])
    console.log('txt---',txt);
    return (
        ReactDOM.createPortal(
            <div>
                <div style={{ top }} className={style.maskLayer}></div>
                {
                    isShow &&
                    <div className={txt.length > 6 ? style.box + ' ' + style.beyondBox : style.box}>
                        <div className={style.Spinner}>
                            <img src={loading} alt="" />
                        </div>
                        <div>{txt}</div>
                    </div>
                }

            </div>,
            LoadingContainer,
        )
    )
}
