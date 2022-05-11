import React, { useCallback, useEffect, useMemo, useState } from 'react';
import style from './style.module.scss';
import { useDevState, useFormatMessage } from '@common/hooks';

import icon_left from '@img/icon_left.png';
import icon_right from '@img/icon_right.png';
import yellow_circle from '@img/yellow_circle.svg';
import blue_circle from '@img/blue_circle.svg';


import classNames from 'classnames';
import { control } from '@common/root/logic';
import { useCurDev } from '@common/hooks';
import toast from '@components/Toast'

import CircleSlider from '../CircleSlider'
import { useDispatch, useSelector } from 'react-redux';
import { getIsDC } from '@common/root/globalSlice';
import { C2F, F2C } from '@common/util';
import { getVacationOutHomeTimer } from '@panel/pages/timer/timerSlice';
import moment from 'moment';



function OffState() {
    const intl = useFormatMessage();
    const isDC = useSelector(getIsDC);
    const [curDev] = useCurDev();
    const isAc = useMemo(() => curDev === 'ac', [curDev])
    const { hp_water_tank_temp } = useDevState();
    return <div className={classNames([style.bgBox, style.offBox])} >
        <div className={style.title}>{intl('off')}</div>
        {!isAc && <div className={style.subtitle}><span>{`${intl('hp_hotwater_temp')}`}</span>{hp_water_tank_temp === undefined ? '--' : (isDC ? Math.round(hp_water_tank_temp) : C2F(hp_water_tank_temp))}{isDC ? '℃' : '℉'}</div>}
    </div>
}

export default function ModeScreen({ showAlert }: { showAlert?: () => void }) {
    const { ac_pwr, hp_pwr, ac_mode, hp_water_tank_temp, ac_temp: _ac_temp, hp_hotwater_temp: _hp_hotwater_temp, hp_auto_wtemp } = useDevState();
    const ac_temp = useMemo(() => Math.round(_ac_temp / 10), [_ac_temp]);
    const intl = useFormatMessage();
    const dispatch = useDispatch();
    const [curDev] = useCurDev();
    const isAc = useMemo(() => curDev === 'ac', [curDev])
    const isDC = useSelector(getIsDC);
    const [vacationOutHomeTimer] = useSelector(getVacationOutHomeTimer);
    const outHomeFlag = useMemo(() => (!!vacationOutHomeTimer?.enable && vacationOutHomeTimer?.startTimer.moment.isBefore(moment()) && vacationOutHomeTimer?.endTimer.moment.isAfter(moment())), [vacationOutHomeTimer]);

    const boundary = useCallback((b: number) => {
        return isDC ? b : C2F(b)
    }, [isDC])

    const transformcurVal = useCallback((cur: number) => {
        return isDC ? Math.round(cur / 10) : C2F(cur / 10)
    }, [isDC])

    const temp2DC = useCallback((t: number) => {
        return isDC ? Math.round(t * 10) : F2C(t)
    }, [isDC])
    // 制冷温度设置范围5～25℃  ==1
    // 制热温度设置范围25～65℃ ==4

    const addCtr = useCallback(() => {
        if (outHomeFlag) {
            showAlert && showAlert();
            return
        }
        console.log('+++');
        if (isAc) {
            if (hp_auto_wtemp) {
                return toast.info('closeAutoWaterTemp');
            }
            if (ac_mode === 4) {
                if (transformcurVal(_ac_temp) + 1 > boundary(65)) return toast.info(intl('Maximum'));
            } else if (ac_mode === 1) {
                if (transformcurVal(_ac_temp) + 1 > boundary(25)) return toast.info(intl('Maximum'));
            }
            control({ 'ac_temp': temp2DC(transformcurVal(_ac_temp) + 1) }, { updateStrategy: 'immediate' })
        } else {
            if (transformcurVal(_hp_hotwater_temp) + 1 > boundary(60)) return toast.info(intl('Maximum'));
            control({ 'hp_hotwater_temp': temp2DC(transformcurVal(_hp_hotwater_temp) + 1) }, { updateStrategy: 'immediate' })
        }
    }, [_ac_temp, _hp_hotwater_temp, ac_mode, boundary, hp_auto_wtemp, intl, isAc, outHomeFlag, showAlert, temp2DC, transformcurVal])

    const decCtr = () => {
        if (outHomeFlag) {
            showAlert && showAlert()
            return
        }
        if (isAc) {
            if (hp_auto_wtemp) {
                return toast.info('closeAutoWaterTemp');
            }
            if (ac_mode === 4) {
                if (transformcurVal(_ac_temp) - 1 < boundary(25)) return toast.info(intl('Minimum'));
            } else if (ac_mode === 1) {
                if (transformcurVal(_ac_temp) - 1 < boundary(5)) return toast.info(intl('Minimum'));
            }
            // setTemp(temp - 1);
            control({ 'ac_temp': temp2DC(transformcurVal(_ac_temp) - 1) }, { updateStrategy: 'immediate' })
        } else {
            if (transformcurVal(_hp_hotwater_temp) - 1 < boundary(30)) return toast.info(intl('Minimum'));
            control({ 'hp_hotwater_temp': temp2DC(transformcurVal(_hp_hotwater_temp) - 1) }, { updateStrategy: 'immediate' })
        }

    }

    const curtemp = useMemo(() => transformcurVal(isAc ? _ac_temp : _hp_hotwater_temp), [transformcurVal, isAc, _ac_temp, _hp_hotwater_temp]);
    const tempMax = useMemo(() => isAc ? (ac_mode === 1 ? boundary(25) : (ac_mode === 4 ? boundary(65) : (ac_temp > boundary(25) ? boundary(65) : boundary(25)))) : boundary(60), [isAc, ac_mode, boundary, ac_temp])
    const tempMin = useMemo(() => isAc ? (ac_mode === 1 ? boundary(5) : (ac_mode === 4 ? boundary(25) : (ac_temp > boundary(25) ? boundary(25) : boundary(5)))) : boundary(30), [isAc, ac_mode, boundary, ac_temp]);
    // const deg = useMemo(() => Math.floor((curtemp - tempMin) / (tempMax - tempMin) * 61), [curtemp, tempMin, tempMax]);

    const [deg, setDeg] = useState(-1);
    const drag = useCallback((val: any) => {
        const _value = val.value;
        const getval = Math.floor((_value - tempMin) / (tempMax - tempMin) * 60) + 1;
        console.log(getval, 'drag-----', _value);
        setDeg(getval)

    }, [tempMax, tempMin])
    const dragStop = useCallback((val: any) => {
        drag(val);
        const value = val.value;

        let _val = value;
        if (isAc) {
            if (ac_mode === 4) {
                if (value > boundary(65)) _val = boundary(65);
                if (value < boundary(25)) _val = boundary(25);
            } else if (ac_mode === 1) {
                if (value > boundary(25)) _val = boundary(25);
                if (value < boundary(5)) _val = boundary(5);
            }
            control({ 'ac_temp': temp2DC(_val) }, { updateStrategy: 'immediate' })
        } else {
            if (value > boundary(60)) _val = boundary(60);
            if (value < boundary(30)) _val = boundary(30);
            control({ 'hp_hotwater_temp': temp2DC(_val) }, { updateStrategy: 'immediate' })
        }
    }, [drag, isAc, ac_mode, boundary, temp2DC])


    // const [showOutHome, toggleOutHome] = useToggle(false);

    const dragStart = useCallback((val: any) => {
        console.log('----dragStart---')
        if (outHomeFlag) {
            showAlert && showAlert();
            return
        }
        dispatch({ type: 'global/controllingUpdate', payload: true });
    }, [dispatch, outHomeFlag, showAlert])
    // const dispatch = useDispatch();
    // const cancelVacationOutHome = useCallback(() => {
    //     const _vacationOutHomeTimer = vacationOutHomeTimer?.clone();
    //     _vacationOutHomeTimer.enable = false;
    //     dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))
    //     toggleOutHome();
    // }, [vacationOutHomeTimer, dispatch, toggleOutHome]);

    // console.log('min---max',_ac_temp);
    const color = useMemo(() => { return (ac_mode === 1 || ac_mode === 0) && isAc ? '#1696FF' : '#FFA41F' }, [ac_mode, isAc])
    // console.log(curtemp, tempMin,(curtemp - tempMin),'---deg', (tempMax - tempMin));
    useEffect(() => {
        const getval = Math.floor((curtemp - tempMin) / (tempMax - tempMin) * 60) + 1;
        setDeg(getval)
    }, [isAc, curtemp, tempMax, tempMin])
    const act = useMemo(() => {
        return deg
        // return deg ? deg : Math.floor((curtemp - tempMin) / (tempMax - tempMin) * 61)
    }, [deg]);
    // console.log(act, '----act====',curtemp);
    const grayFlag = ((!ac_mode || hp_auto_wtemp || outHomeFlag) && isAc) || (outHomeFlag && !isAc);
    const progressbar = useMemo(() => (
        <svg width="289" height="253" viewBox="0 0 289 253" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M143.975 0H145.975V20.0889H143.975V0Z" fill={act > 30 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M155.059 0.359131L157.054 0.499264L155.659 20.5392L153.664 20.3991L155.059 0.359131Z" fill={act > 31 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M166.257 1.58301L168.232 1.89727L165.104 21.7388L163.128 21.4245L166.257 1.58301Z" fill={act > 32 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M177.152 3.65942L179.101 4.11133L174.602 23.6854L172.653 23.2335L177.152 3.65942Z" fill={act > 33 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M188.028 6.6084L189.93 7.22918L183.749 26.3348L181.847 25.7141L188.028 6.6084Z" fill={act > 34 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M198.472 10.3523L200.327 11.1048L192.835 29.7309L190.98 28.9784L198.472 10.3523Z" fill={act > 35 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M208.763 14.9553L210.545 15.8673L201.465 33.7667L199.683 32.8546L208.763 14.9553Z" fill={act > 36 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M218.506 20.2766L220.22 21.3113L209.919 38.5308L208.205 37.4962L218.506 20.2766Z" fill={act > 37 && !grayFlag ? color : '#E1E1E1'} />


            {/* <path fillRule="evenodd" clipRule="evenodd"
                d="M48.9775 252.45L47.4913 251.106L60.8739 236.177L62.3601 237.521L48.9775 252.45Z" fill={act >= 0 ? color : '#E1E1E1'} /> */}
            <path fillRule="evenodd" clipRule="evenodd"
                d="M40.8752 244.59L39.5112 243.121L54.1383 229.42L55.5023 230.889L40.8752 244.59Z" fill={act >= 0 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M33.5317 236.242L32.2731 234.681L47.816 222.039L49.0747 223.6L33.5317 236.242Z" fill={act > 1 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M26.7372 227.218L25.6188 225.552L42.1996 214.319L43.318 215.984L26.7372 227.218Z" fill={act > 2 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M20.7671 217.83L19.7671 216.09L37.0876 206.046L38.0876 207.785L20.7671 217.83Z" fill={act > 3 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M15.5348 208.009L14.658 206.203L32.6339 197.397L33.5107 199.202L15.5348 208.009Z" fill={act > 4 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M10.991 197.656L10.2742 195.78L28.9459 188.581L29.6626 190.456L10.991 197.656Z" fill={act > 5 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M7.3335 187.14L6.74875 185.219L25.8749 179.345L26.4596 181.266L7.3335 187.14Z" fill={act > 6 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M4.43848 176.205L4.02265 174.24L23.5856 170.063L24.0014 172.028L4.43848 176.205Z" fill={act > 7 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M2.44409 165.248L2.16575 163.258L21.9711 160.462L22.2495 162.452L2.44409 165.248Z" fill={act > 8 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M1.26758 153.995L1.16291 151.989L21.1355 150.937L21.2402 152.944L1.26758 153.995Z" fill={act > 9 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M0.984131 142.859L1.01904 140.85L21.016 141.201L20.9811 143.209L0.984131 142.859Z" fill={act > 10 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M1.55444 131.559L1.7635 129.561L21.6539 131.661L21.4449 133.658L1.55444 131.559Z" fill={act > 11 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M2.98877 120.513L3.33607 118.534L23.0322 122.023L22.6849 124.001L2.98877 120.513Z" fill={act > 12 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M5.26562 109.611L5.74947 107.662L25.1554 112.522L24.6715 114.471L5.26562 109.611Z" fill={act > 13 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M8.41016 98.7465L9.06129 96.847L27.9717 103.387L27.3205 105.287L8.41016 98.7465Z" fill={act > 14 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M12.3381 88.3293L13.1196 86.4802L31.5297 94.3295L30.7483 96.1787L12.3381 88.3293Z" fill={act > 15 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M17.1178 78.0839L18.0567 76.3101L35.7157 85.7412L34.7768 87.5149L17.1178 78.0839Z" fill={act > 16 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M22.6023 68.4021L23.6621 66.6985L40.6231 77.344L39.5633 79.0476L22.6023 68.4021Z" fill={act > 17 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M28.9021 59.0223L30.1057 57.418L46.0784 69.5078L44.8748 71.1122L28.9021 59.0223Z" fill={act > 18 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M35.8113 50.3088L37.1234 48.7927L52.2176 61.9722L50.9055 63.4883L35.8113 50.3088Z" fill={act > 19 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M43.4797 42.0206L44.9184 40.6251L58.8116 55.0759L57.3729 56.4714L43.4797 42.0206Z" fill={act > 20 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M51.6473 34.485L53.1794 33.1937L66.0352 48.5826L64.5031 49.8739L51.6473 34.485Z" fill={act > 21 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M60.3679 27.6038L61.986 26.423L73.7416 42.6753L72.1236 43.8561L60.3679 27.6038Z" fill={act > 22 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M69.7295 21.3113L71.4438 20.2766L81.7446 37.4962L80.0302 38.5308L69.7295 21.3113Z" fill={act > 23 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M79.4048 15.8673L81.1868 14.9553L90.2666 32.8546L88.4846 33.7666L79.4048 15.8673Z" fill={act > 24 && !grayFlag ? color : '#E1E1E1'} />


            <path fillRule="evenodd" clipRule="evenodd"
                d="M89.6228 11.1049L91.4772 10.3523L98.9693 28.9784L97.1149 29.731L89.6228 11.1049Z" fill={act > 25 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M100.02 7.22925L101.922 6.60847L108.102 25.7141L106.2 26.3349L100.02 7.22925Z" fill={act > 26 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M110.848 4.11145L112.797 3.65955L117.296 23.2336L115.347 23.6855L110.848 4.11145Z" fill={act > 27 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M121.717 1.89734L123.693 1.58308L126.821 21.4246L124.846 21.7388L121.717 1.89734Z" fill={act > 28 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M132.896 0.499268L134.891 0.359135L136.286 20.3991L134.291 20.5392L132.896 0.499268Z" fill={act > 29 && !grayFlag ? color : '#E1E1E1'} />


            <path fillRule="evenodd" clipRule="evenodd"
                d="M266.264 67.1499L267.324 68.8535L250.363 79.4991L249.303 77.7954L266.264 67.1499Z" fill={act > 43 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M271.869 76.7615L272.808 78.5352L255.149 87.9664L254.21 86.1927L271.869 76.7615Z" fill={act > 44 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M276.806 86.9315L277.588 88.7807L259.178 96.6301L258.396 94.7809L276.806 86.9315Z" fill={act > 45 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M280.865 97.2983L281.516 99.1978L262.605 105.738L261.954 103.839L280.865 97.2983Z" fill={act > 46 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M284.176 108.113L284.66 110.062L265.254 114.922L264.77 112.973L284.176 108.113Z" fill={act > 47 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M286.59 118.986L286.937 120.964L267.241 124.452L266.893 122.474L286.59 118.986Z" fill={act > 48 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M288.162 130.012L288.371 132.01L268.481 134.11L268.272 132.112L288.162 130.012Z" fill={act > 49 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M288.907 141.302L288.942 143.31L268.945 143.661L268.91 141.652L288.907 141.302Z" fill={act > 50 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M288.763 152.44L288.658 154.446L268.686 153.395L268.79 151.389L288.763 152.44Z" fill={act > 51 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M287.76 163.71L287.482 165.699L267.676 162.903L267.955 160.914L287.76 163.71Z" fill={act > 52 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M285.903 174.692L285.487 176.657L265.924 172.48L266.34 170.515L285.903 174.692Z" fill={act > 53 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M283.177 185.67L282.592 187.591L263.466 181.718L264.051 179.797L283.177 185.67Z" fill={act > 54 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M279.652 196.232L278.935 198.107L260.263 190.908L260.98 189.032L279.652 196.232Z" fill={act > 55 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M275.268 206.654L274.391 208.46L256.415 199.654L257.292 197.848L275.268 206.654Z" fill={act > 56 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M270.159 216.542L269.159 218.281L251.838 208.237L252.838 206.497L270.159 216.542Z" fill={act > 57 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M264.307 226.004L263.189 227.669L246.608 216.436L247.726 214.77L264.307 226.004Z" fill={act > 58 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M257.653 235.133L256.394 236.694L240.851 224.052L242.11 222.49L257.653 235.133Z" fill={act > 59 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M250.415 243.572L249.051 245.041L234.423 231.341L235.787 229.871L250.415 243.572Z" fill={act > 60 && !grayFlag ? color : '#E1E1E1'} />
            {/* <path fillRule="evenodd" clipRule="evenodd"
                d="M242.434 251.558L240.948 252.902L227.566 237.973L229.052 236.629L242.434 251.558Z" fill={act > 61 ? color : '#E1E1E1'} /> */}


            <path fillRule="evenodd" clipRule="evenodd"
                d="M227.94 26.8743L229.558 28.0551L217.802 44.3073L216.184 43.1265L227.94 26.8743Z" fill={act > 38 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M236.746 33.645L238.278 34.9363L225.423 50.3253L223.891 49.034L236.746 33.645Z" fill={act > 39 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M245.007 41.0765L246.446 42.472L232.553 56.9227L231.114 55.5272L245.007 41.0765Z" fill={act > 40 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M252.802 49.2441L254.114 50.7603L239.02 63.9398L237.708 62.4236L252.802 49.2441Z" fill={act > 41 && !grayFlag ? color : '#E1E1E1'} />
            <path fillRule="evenodd" clipRule="evenodd"
                d="M259.82 57.8694L261.024 59.4738L245.051 71.5635L243.847 69.9592L259.82 57.8694Z" fill={act > 42 && !grayFlag ? color : '#E1E1E1'} />
        </svg>

    ), [act, grayFlag, color]);

    return <React.Fragment>
        {/* <Alert title={intl('needCloseVacation')} show={showOutHome} onCancel={toggleOutHome} onCertain={cancelVacationOutHome} /> */}
        {(!ac_pwr && isAc) || (!hp_pwr && !isAc) ? <OffState /> : (
            <div className={style.outBox}>
                <div className={style.progressbar}>
                    <div>{progressbar}</div>
                    <div className={style.CircleSlider}>
                        <div className={style.circleBg}><img src={(ac_mode === 1 || ac_mode === 0) && isAc ? blue_circle : yellow_circle} alt="" /></div>

                        {isAc && ac_mode === 0 && <CircleSlider isAc={isAc} start={dragStart} stop={dragStop} drag={drag} className={classNames((ac_mode === 1 || ac_mode === 0) && isAc ? 'blue_circle' : 'yellow_circle', ac_mode === 0 && 'autoCSS')} value={curtemp} min={tempMin} max={tempMax} acMode={ac_mode} disabled={!ac_mode || hp_auto_wtemp || outHomeFlag} />}
                        {isAc && ac_mode !== 0 && <CircleSlider isAc={isAc} start={dragStart} stop={dragStop} drag={drag} className={classNames((ac_mode === 1 || ac_mode === 0) && isAc ? 'blue_circle' : 'yellow_circle', ac_mode === 0 && 'autoCSS')} value={curtemp} min={tempMin} max={tempMax} acMode={ac_mode} disabled={!ac_mode || hp_auto_wtemp || outHomeFlag} />}
                        {!isAc && <CircleSlider isAc={false} start={dragStart} stop={dragStop} drag={drag} className={classNames((ac_mode === 1 || ac_mode === 0) && isAc ? 'blue_circle' : 'yellow_circle', ac_mode === 0 && 'autoCSS')} value={curtemp} min={tempMin} max={tempMax} acMode={1} disabled={outHomeFlag} />}
                        <div className={classNames({ [style.bgBox]: true, [style.onBuleBox]: (ac_mode === 1 || ac_mode === 0) && isAc, [style.onYellowBox]: isAc && ac_mode === 4 })}>
                            {(ac_mode !== 0 || !isAc) && <div className={style.icon_left} onClick={decCtr}><img src={icon_left} alt="" /></div>}
                            {
                                (ac_mode !== 0 || !isAc) && <div className={style.title}><em>{isDC ? '℃' : '℉'}</em></div>

                            }
                            {(ac_mode !== 0 || !isAc) && <div className={style.icon_right} onClick={addCtr}><img src={icon_right} alt="" /></div>}
                            {
                                !isAc && <div className={style._hp_hotwater_temp}><span>{`${intl('hp_hotwater_temp')} `}</span>{`${hp_water_tank_temp === undefined ? '--' : boundary(hp_water_tank_temp)}${isDC ? '℃' : '℉'}`}</div>
                            }
                        </div>
                    </div>

                </div>

            </div>
        )}
    </React.Fragment>

}