import classNames from "classnames";
import style from './style.module.scss';

export default function Tab({ left, right, onSelect, curPosition = 'left' }:
    { left: string, right: string, onSelect: (val: 'left' | 'right') => void, curPosition: 'left' | 'right' }) {
    const _onSelect = (p: 'left' | 'right') => {
        onSelect(p);
    }
    return (
        <div className={style.tab}>
            <ul>
                <li onClick={() => _onSelect('left')} className={classNames({ [style.active]: curPosition === 'left' })} >
                    <p>{left}</p>
                </li>
                <li onClick={() => _onSelect('right')} className={classNames({ [style.active]: curPosition === 'right' })}>
                    <p>{right}</p>
                </li >
            </ul>
        </div>
    )
}