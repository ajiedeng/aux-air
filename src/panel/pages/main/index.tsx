import Page from "@components/Page";
import Navbar from "@components/Navbar";
import { useFormatMessage, useDevState, useCurDev, useControl } from "@hooks";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
import moment from "moment";
import style from './style.module.scss'
import jssdk from 'jssdk';
import { useHistory } from "react-router";
import SwitchButton from "./SwitchButton";
import FunctionBar from "./FunctionBar";
import ModeScreen from "./ModeScreen";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@common/components/Icon";
import switchoff from '@img/switchOff.svg';
import switchBlue from '@img/on_blue.svg';
import switchYellow from '@img/on_yellow.svg';
import modeSrc from "./modeSrc";
import Switcher from "@common/components/Switcher";
import TxtArrow from "@common/components/TxtArrow";
import ModePopup from "./ModePopup";
import cold from '@img/cold.svg';
import hot from '@img/hot.svg';
import auto from '@img/auto.svg';
import select_yellow from '@img/select_yellow.svg';
import select_blue from '@img/select_blue.svg';
import { queryTimer, getVacationOutHomeTimer, upsertTimer, getMuteTimer, getEcoTimer } from "../timer/timerSlice";
import { getDeviceID, getOnline } from "@common/root/deviceStateSlice";
import { getFamilyId, getIsStatusReadyTimeout, getUserId } from "@common/root/globalSlice";
import Alert from "@common/components/Alert";
import { useToggle } from "@hooks";
import classNames from "classnames";
// import required modules

export default function Main() {
    const intl = useFormatMessage();
    const control = useControl();
    const dispatch = useDispatch();
    const did = useSelector(getDeviceID);
    const fid = useSelector(getFamilyId);
    const uid = useSelector(getUserId);
    const [showAlert, toggleAlert] = useToggle(false);
    const [showOutHome, toggleOutHome] = useToggle(false);
    const [muteTimer1, muteTimer2] = useSelector(getMuteTimer);
    const [ecoTimer] = useSelector(getEcoTimer);
    const isStatusReadyTimeout = useSelector(getIsStatusReadyTimeout);
    const { ac_pwr, ac_mode, ecomode, hp_pwr, hp_auto_wtemp, hp_fast_hotwater, qtmode } = useDevState();
    const [curDev, setCurDev] = useCurDev();
    const [vacationOutHomeTimer] = useSelector(getVacationOutHomeTimer);
    const outHomeFlag = useMemo(() => (!!vacationOutHomeTimer?.enable && vacationOutHomeTimer?.startTimer.moment.isBefore(moment()) && vacationOutHomeTimer?.endTimer.moment.isAfter(moment())), [vacationOutHomeTimer]);
    const isAc = useMemo(() => curDev === 'ac', [curDev])
    const onlineVal = useSelector(getOnline);
    const online = useMemo(() => onlineVal === '1' || onlineVal === '2', [onlineVal]);
    const onClickMore = () => {
        jssdk.platformSDK.callNative('openDevicePropertyPage');
    }
    const history = useHistory();
    const swiper: any = useRef(null);
    const ishot = useMemo(() => ac_mode === 4, [ac_mode]);
    const iconSrc = useMemo(() => {
        const src = {
            ac: {
                pwr: ac_pwr ? (ishot ? switchYellow : switchBlue) : switchoff,
                mode: (modeSrc as any)[ac_mode || 0].icon.on,
            },
            wh: {
                pwr: hp_pwr ? switchYellow : switchoff
            }
        }
        return src
    }, [ac_pwr, hp_pwr, ac_mode, ishot])

    const turnOffMuteTimer = useCallback(() => {
        for (const timer of [muteTimer1, muteTimer2]) {
            if (!timer?.enable) continue;
            const _muteTimer = timer?.clone();
            _muteTimer.enable = false;
            dispatch(upsertTimer({ timer: _muteTimer }))
        }
    }, [dispatch, muteTimer1, muteTimer2])

    const turnOffECOTimer = useCallback(() => {
        if (!ecoTimer?.enable) return;
        const _ecoTimer = ecoTimer?.clone();
        _ecoTimer.enable = false;
        dispatch(upsertTimer({ timer: _ecoTimer }))
    }, [dispatch, ecoTimer])

    const togglePower = () => {
        if (outHomeFlag) {
            return toggleOutHome()
        }
        let needCloseQtmode = false;
        let cmd: any = { [isAc ? 'ac_pwr' : 'hp_pwr']: isAc ? (ac_pwr ? 0 : 1) : (hp_pwr ? 0 : 1) };
        if (cmd.hp_pwr === 1) {
            cmd.hp_hotwater_temp = 550;
        }
        if (cmd.ac_pwr === 1) {
            if (ac_mode === 1) cmd.ac_temp = 70;
            if (ac_mode === 4) cmd.ac_temp = 450;
        }
        if ((ac_pwr === 0 && hp_pwr === 1 && !isAc) || (ac_pwr === 1 && hp_pwr === 0 && isAc)) {
            needCloseQtmode = true;
        }
        needCloseQtmode && (cmd.qtmode = 0);
        needCloseQtmode && turnOffMuteTimer();
        if (cmd.ac_pwr === 0) {
            cmd.ecomode = 0;
            turnOffECOTimer()
        };
        control(cmd)
    }
    const toggleAutoWaterTemp = () => {
        if (outHomeFlag) {
            return toggleOutHome()
        }
        if (ecomode && hp_auto_wtemp === 0) {
            return toggleAlert();
        }
        control({ 'hp_auto_wtemp': hp_auto_wtemp ? 0 : 1 })
    }
    const toggleFastHeat = () => {
        control({ 'hp_fast_hotwater': hp_fast_hotwater ? 0 : 1 })
    }

    // const [mode, setMode] = useState(ac_mode);
    const [modePopup, setModePopup] = useState(false);

    const modeClick = () => {
        setModePopup(true)
    }

    const modetCtr = (index: number) => {
        let cmd: any = { 'ac_mode': index };
        if (index === 1) cmd.ac_temp = 70;
        if (index === 4) cmd.ac_temp = 450;
        control(cmd).then(() => {
            setModePopup(false);
        })

    }
    const modelist = useMemo(() => [
        { icon: cold, text: intl('cold'), index: 1 },
        { icon: hot, text: intl('hot'), index: 4 },
        { icon: auto, text: intl('auto'), index: 0 }
    ], [intl])
    const go2Vacation = () => {
        // return toast.info('暂不支持');
        history.push('/vacation')
    };

    const cancelEco = () => {
        toggleAlert();
        control({ 'hp_auto_wtemp': hp_auto_wtemp ? 0 : 1, 'ecomode': 0 })
    }

    const cancelVacationOutHome = useCallback(() => {
        const _vacationOutHomeTimer = vacationOutHomeTimer?.clone();
        _vacationOutHomeTimer.enable = false;
        dispatch(upsertTimer({ timer: _vacationOutHomeTimer }))
        toggleOutHome();
    }, [vacationOutHomeTimer, dispatch, toggleOutHome]);

    useEffect(() => {
        did && uid && fid && dispatch(queryTimer())
    }, [dispatch, did, uid, fid])
    const onSlideChange = useCallback((swiper: any) => {
        console.log('---onSlideChange---')
        swiper.activeIndex ? setCurDev('wh') : setCurDev('ac')
    }, [setCurDev])
    return (
        <Page className={classNames(style.mainPage, { [style.hiddenCss]: modePopup })}>
            <Navbar exit className={style.navbar} right={[{ icon: intl('timer'), onClick: () => history.push('/timer') }, { icon: intl('setting'), onClick: onClickMore }]} />
            <SwitchButton _swiper={swiper.current} />
            <Alert title={intl('needCloseVacation')} show={showOutHome} onCancel={toggleOutHome} onCertain={cancelVacationOutHome} />
            <Alert show={showAlert} onCancel={toggleAlert} onCertain={cancelEco} />
            <ModePopup show={modePopup} onClose={() => setModePopup(false)}>
                <ul className={style.ModePopup}>
                    {
                        modelist.map((item, index) => {
                            return (
                                <li key={index} onClick={() => modetCtr(item.index)}>
                                    <div><img src={item.icon} alt="" />{item.text}</div>
                                    {ac_mode === item.index && <img className={style.select} src={(ac_mode === 1) || (ac_mode === 0) ? select_blue : select_yellow} alt="" />}
                                </li>
                            )
                        })
                    }
                </ul>
            </ModePopup>
            {
                ((hp_pwr !== undefined && ac_pwr !== undefined) || !online || isStatusReadyTimeout) &&
                <Swiper
                    rewind={true}
                    initialSlide={isAc ? 0 : 1}
                    className="mySwiper"
                    onSlideChange={onSlideChange}
                    allowTouchMove={ false }
                    onSwiper={(_swiper) => {
                        swiper.current = _swiper;
                    }}
                >
                    <SwiperSlide>
                        <ModeScreen showAlert={toggleOutHome} />
                        <div className={style.funButton}>
                            <FunctionBar title={intl('acPower')} onClick={togglePower}><Icon src={iconSrc[curDev].pwr} /></FunctionBar>
                            <FunctionBar show={isAc && ac_pwr === 1} title={intl('acMode')} onClick={modeClick}><Icon src={iconSrc[curDev as 'ac'].mode} /></FunctionBar>
                            <FunctionBar show={isAc && ac_pwr === 1} title={intl('autoWaterTemp')}><Switcher cold={!ishot} on={hp_auto_wtemp} onChange={toggleAutoWaterTemp} /></FunctionBar>
                            <FunctionBar title={intl('eco')} onClick={() => history.push('/eco')}><TxtArrow title={ecomode ? intl('turnOn') : ''} /></FunctionBar>
                            <FunctionBar title={intl('mute')} onClick={() => history.push('/mute')}><TxtArrow title={qtmode ? intl('turnOn') : ''} /></FunctionBar>
                            <FunctionBar show={true} title={intl('vacation')} onClick={go2Vacation}><TxtArrow /></FunctionBar>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <ModeScreen showAlert={toggleOutHome}/>
                        <div className={style.funButton}>
                            <FunctionBar title={intl('whPower')} onClick={togglePower}><Icon src={iconSrc[curDev].pwr} /></FunctionBar>
                            <FunctionBar show={!isAc && hp_pwr === 1} title={intl('quickHeat')}><Switcher on={hp_fast_hotwater} onChange={toggleFastHeat} /></FunctionBar>
                            {/* <FunctionBar title={intl('eco')} onClick={() => history.push('/eco')}><TxtArrow title={ecomode ? intl('turnOn') : ''} /></FunctionBar> */}
                            <FunctionBar title={intl('mute')} onClick={() => history.push('/mute')}><TxtArrow title={qtmode ? intl('turnOn') : ''} /></FunctionBar>
                            <FunctionBar show={true} title={intl('vacation')} onClick={go2Vacation}><TxtArrow /></FunctionBar>
                        </div>
                    </SwiperSlide>
                </Swiper>
            }
        </Page >
    )
}