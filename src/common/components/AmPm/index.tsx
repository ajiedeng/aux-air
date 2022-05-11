import React from 'react';
import style from './style.module.scss';
import classNames from 'classnames';
export type timeType = 'AM' | 'PM';
export interface AmPmProps {
    onSelect?: (type: timeType) => void,
    type?: 'AM' | 'PM';
}
export default function AmPm({ type = 'AM', onSelect }: AmPmProps) {
    const _onChange = (e: Event) => {
        e.stopPropagation();
        onSelect && onSelect(type === 'AM' ? 'PM' : 'AM')
    }
    return (
        <div onClick={_onChange as any} className={classNames(style.switcherBox)}>
            <div className={classNames(style.am, { [style.on]: type === 'AM' })}>AM</div>
            <div className={classNames(style.pm, { [style.on]: type === 'PM' })}>PM</div>
        </div>
    )
}