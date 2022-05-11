import React, { useMemo } from 'react';
import Props from './props';
import style from './style.module.scss'
const r = 92
const circleLen = Math.PI * 2 * r;
export default function ProgressCircle({ percent = 0 }: Props) {
    const _dashLen = useMemo(() => circleLen * percent / 100, [percent])
    return (
        <svg className={style.circle} width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="4" />
            <circle cx="100" cy="100" r={r} fill="none" transform="rotate(-90,100,100)" stroke="#fff" strokeWidth="8" strokeDasharray={`${_dashLen},${circleLen}`}
                strokeLinecap="round" />
        </svg>
    )
}