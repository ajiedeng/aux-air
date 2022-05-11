import React from 'react';
import style from './style.module.scss'
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import { useFormatMessage } from '@hooks';
export default function Alert({ title = '', show, onCancel, onCertain }: {
    title?: string;
    show: boolean;
    onCancel: () => void;
    onCertain: () => void;
}) {
    const intl = useFormatMessage();
    return (
        <CSSTransition in={show} timeout={200} classNames="alert" unmountOnExit>
            <div className={classNames(style.popupBox)}>
                <div className={style.maskLayer}></div>
                <div className={classNames(style.contentBox, { [style.show]: show })}>
                    <div className={style.titleBox}>
                        {title || intl('ecoTips')}
                    </div>
                    <div className={style.bottom}>
                        <p className={style.cancle} onClick={onCancel}>{intl('popupCancel')}</p>
                        <p className={style.save} onClick={onCertain}>{intl('popupCertain')}</p>
                    </div>
                </div>
            </div>
        </CSSTransition>
    )
}