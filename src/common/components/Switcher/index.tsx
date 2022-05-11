import React, { useMemo } from 'react';
import style from './style.module.scss';
import classNames from 'classnames';
import { useCurDev } from '@common/hooks';
interface Props {
    onChange?: (val: boolean) => void,
    on: boolean,
    cold?: boolean,
    intimer?: boolean
}
export default function Switcher({ on = false, cold = true, intimer = false, onChange }: Props) {
    const _onChange = (e: Event) => {
        e.stopPropagation();
        onChange && onChange(!on)
    }
    const [curDev] = useCurDev();
    const isAc = useMemo(() => curDev === 'ac', [curDev])

    return (
        <div onClick={_onChange as any} className={classNames(style.switcherBox, intimer ? style.intimer : (cold && isAc ? style.cold : style.warm), { [style.on]: on })}>
            <div className={style.circle}></div>
        </div>
    )
}