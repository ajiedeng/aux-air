import React from 'react';
import style from './style.module.scss';
import classNames from 'classnames';
import arrow from './arrow.svg';
interface Props {
    onClick?: () => void,
    title?: string
}
export default function TxtArrow({ title, onClick }: Props) {
    return (
        <div onClick={onClick} className={classNames(style.arrowBox)}>
            <span>{title}</span>
            <img src={arrow} alt="" />
        </div>
    )
}