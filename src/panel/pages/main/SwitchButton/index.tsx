import { useFormatMessage, useCurDev } from "@hooks";
import classNames from "classnames";
import { useCallback } from "react";
import style from './style.module.scss';
interface ButtonType {
    on: boolean,
    onClick: () => void,
    text: string
}
function Button({ on = true, onClick, text }: ButtonType) {
    return <button onClick={onClick} className={classNames(on ? style.on : style.off)}>{text}</button>
}

export default function SwitchButton({ _swiper }: { _swiper: any }) {
    const intl = useFormatMessage();
    const [curDev, setCurDev] = useCurDev();
    const onClickAc = useCallback(() => {
        if (curDev === 'ac') return;
        _swiper.slideNext();
        setCurDev('ac')
    }, [_swiper, curDev, setCurDev])
    const onClickWh = useCallback(() => {
        if (curDev === 'wh') return;
        _swiper.slidePrev();
        setCurDev('wh')
    }, [_swiper, curDev, setCurDev])
    return <div className={style.switchBox}>
        <Button on={curDev === 'ac'} onClick={onClickAc} text={intl('ac')} />
        <Button on={curDev === 'wh'} onClick={onClickWh} text={intl('wh')} />
    </div>
}