/*
 * @Author: ajie.deng
 * @Date: 2022-02-25 09:24:24
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-02-28 16:53:34
 * @FilePath: \aux-air\src\panel\pages\main\FunctionBar\index.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import classNames from 'classnames';
import React from 'react';
import style from './style.module.scss';

export default function ErrorBar({ error }: { error: Error }) {
    console.log('come in error boundry')
    return <div className={classNames(style.errorBarBox)} >
        <div className={style.title}>抱歉，页面被意大利炮炸没了:{error.message}</div>
    </div>
}