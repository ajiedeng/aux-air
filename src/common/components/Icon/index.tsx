import React from 'react';
import Props from './props';
import style from './style.module.scss';
import classNames from 'classnames';
export default function Icon({ src, disable = false, onClick }: Props) {
    const _name=(src?.split('/')[3].split('.')[0]==="on_blue")||(src?.split('/')[3].split('.')[0]==="on_yellow")||(src?.split('/')[3].split('.')[0]==="switchOff")?true:false;
    return (
        <div onClick={disable ? () => { } : onClick} className={classNames(style.iconBox,{[style.otherCss]:_name})}>
            <div className={style.circle} style={{ backgroundImage: `url(${src})` }}></div>
        </div>
    )
}