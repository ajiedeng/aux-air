/*
 * @Author: ajie.deng
 * @Date: 2022-02-25 10:40:40
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-02-25 14:34:56
 * @FilePath: \aux-air\src\panel\pages\main\ModePopup\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */

import { isIphoneX } from '@common/util/device';
import classNames from 'classnames';
import React from 'react';
import style from './style.module.scss';


// interface ModePopupType
export default function ModePopup({show,children, onClose }: { show:boolean,children: React.ReactNode,onClose: () => void}) {
    return show ?(
        <div className={classNames({[style.bottomX]: isIphoneX},style.ModePopup)}>
             <div className={style.maskLayer} onClick={onClose}></div>
            {children}
        </div>
    ):null
}