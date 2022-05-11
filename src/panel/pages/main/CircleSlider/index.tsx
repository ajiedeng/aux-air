/*
 * @Author: ajie.deng
 * @Date: 2022-03-11 17:36:34
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 15:11:49
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\panel\pages\main\CircleSlider\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */



import React, { useCallback, useEffect, useRef } from "react";

import $ from 'jquery'
import '@components/libs/roundSlider-1.6.1/roundslider.js'
import style from './style.module.scss'
import '@components/libs/roundSlider-1.6.1/roundslider.min.css'
import './style.css'
import classNames from "classnames";
import { useFormatMessage } from "@common/hooks";
export default function CircleSlider({ change, stop, start, drag, acMode, isAc, className, value, max, min, disabled }: { change?: (val: any) => void, stop: (val: any) => void, start?: (val: any) => void, drag: (val: any) => void, acMode: number, isAc: boolean, className: string, value: number, max: number, min: number, disabled: boolean }) {
    const slider = useRef(null);
    const intl = useFormatMessage();
    const tooltipVal1 = useCallback((args: any) => {
        console.log('--tooltipVal1--in---effect--acMode,isAc', acMode, isAc)
        return acMode === 0 && isAc ? intl('auto') : `${args.value}`;
    },[acMode, intl, isAc])
    useEffect(() => {
        console.log('----this---effect--acMode,isAc', acMode, isAc);

        ($(slider.current as any) as any).roundSlider({
            radius: 112,
            width: 9,
            handleSize: "+12",
            circleShape: "pie",
            sliderType: "default",
            showTooltip: true,
            editableTooltip: false,
            value: value,
            startAngle: 315,
            min: min,
            max: max,
            tooltipFormat: tooltipVal1,
            change: change,
            stop: stop,
            start,
            drag: drag,
            disabled: disabled
        });
        if(disabled){
            $('.rs-handle.rs-move').css('display','none')
        }else{
            $('.rs-handle.rs-move').css('display','block')
        }
    }, [change, stop, drag, max, min, value, tooltipVal1, acMode, isAc, disabled, start])
    return (
        <div className={classNames(style.CircleSlider, className, 'CircleSlider')} ref={slider}>
        </div>
    )
}