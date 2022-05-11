import React from 'react';
import Props from './props';
import style from './style.module.scss'
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import { useFormatMessage } from '@hooks';
export default function Popup({ children, title = 'title', show, onCancel, onSave, onClose = onCancel, cancelTxt, saveTxt }: Props) {
    const intl = useFormatMessage();
    return (
        <CSSTransition in={show} timeout={200} classNames="alert" unmountOnExit>
            <div className={classNames(style.popupBox)}>
                <div className={style.maskLayer} onClick={onClose}></div>
                <div className={classNames(style.contentBox,{[style.show]:show})}>
                    <div className={style.header}>
                        <p className={style.cancle} onClick={onCancel}>{cancelTxt || intl('popupCancel')}</p>
                        <p className={style.title}>{title}</p>
                        <p className={style.save} onClick={onSave}>{saveTxt || intl('popupCertain')}</p>
                    </div>
                    {children}
                </div>
            </div>
        </CSSTransition>
    )
}