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


interface FunctionBarType {
    title: string,
    children: React.ReactNode,
    show?: boolean,
    merge?:boolean,
    onClick?: () => void
}
export default function FunctionBar({ title, children, onClick, show = true,merge=false }: FunctionBarType) {
    return show ? <div className={classNames(style.functionBarBox,{[style.merge]:merge})} onClick={onClick}>
        
        <div className={style.title}>{title}</div> {children}
    </div> : null
}