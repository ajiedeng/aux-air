import React from "react";
import classNames from "classnames";
import style from './style.module.scss';

export default function Tab({text,onClick,select}:{text:{opt:string,opt2:string},onClick:(val:string)=>void,select:string}){
    return (
        <div className={style.tab}>
            <ul>
                <li onClick={()=>onClick('outhome')}  className={classNames({ [style.active]: select === 'outhome' })} >
                    <p>{text.opt}</p>
                </li>
                <li onClick={()=>onClick('athome')} className={classNames({ [style.active]: select === 'athome' })}>
                    <p>{text.opt2}</p>
                </li >
            </ul>
        </div>
    )
}