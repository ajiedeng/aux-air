import React from 'react';
import { useSelector } from 'react-redux';
import Props from './props';
import style from './style.module.scss'
import classNames from 'classnames';
import { isIphoneX } from '@util/device';
export default function Page({ children, wholePage = false, className: _className }: Props) {
    const height = useSelector((state: any) => state.global.statusBarHeight);
    return (
        <div style={{ 'paddingTop': wholePage ? '0px' : height }} className={classNames(style.pageBox, _className)}>
            <div className={classNames(style.pageContainer, { [style.noPaddingTop]: wholePage, [style.bottomX]: isIphoneX })}>
                {children}
            </div>
        </div>
    )
}