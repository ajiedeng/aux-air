/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-24 17:36:03
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\common\root\provider\AutoLoopRoot.tsx
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AutoLoopRootProps } from './interface';
import Loading from '@components/Loading';
import * as logic from '@root/logic.js';
import { loadingUpdate, readyUpdate, getUserInfo, getFamilyInfo, getStatusBar, getAppSetting, getIsStatusReadyTimeout, setIsStatusReadyTimeout } from '@root/globalSlice';
import { notifyError } from '@components/utils';
import { updateDevState, websocketUpdateDevState } from '@root/deviceStateSlice';
import { useFormatMessage } from '@hooks';
import { getReady, getLoading } from '@root/globalSlice';
import { getStatusReady } from '@root/deviceStateSlice';
import { getTimerLoading } from '@panel/pages/timer/timerSlice';
import jssdk from 'jssdk';
import toast from '@components/Toast';
import store from '@common/store';


export default function AutoLoopRoot({ children, setting }: AutoLoopRootProps) {
  const dispatch = useDispatch();
  const intl = useFormatMessage();
  const isReady = useSelector(getReady);
  const isLoading = useSelector(getLoading);
  const isStatusReady = useSelector(getStatusReady);
  const timerloading = useSelector(getTimerLoading);
  const update = useCallback(() => {
    !isReady && dispatch(readyUpdate(true));
    const state = logic.getState();
    dispatch(updateDevState(state));
  }, [dispatch, isReady]);

  const setLoading = useCallback(
    (loadingAct: boolean) => dispatch(loadingUpdate(loadingAct)),
    [dispatch]
  );

  useEffect(() => {
    dispatch(getUserInfo());
    dispatch(getFamilyInfo());
    dispatch(getStatusBar());
    dispatch(getAppSetting())
  }, [dispatch])



  useEffect(() => {
    (window as any).websocketUpdate = (_websocketState: string | { data: {}; status: number; }) => {
      console.log(`----websocketUpdate---${typeof _websocketState}`, _websocketState);
      const { global: { controlling } } = store.getState();
      console.log('------controlling--------', controlling)
      const websocketState = typeof _websocketState === 'string' ? (JSON.parse(_websocketState) as { data: {}; status: number; }) : _websocketState
      !controlling && websocketState.status === 0 && dispatch(websocketUpdateDevState(websocketState.data));
    }
    jssdk.platformSDK.callNative('subscribeDeviceStatus', [{
      callbackMethod: 'websocketUpdate'
    }])

  }, [dispatch])

  useEffect(() => {

    const defaultLogicProp = {
      loading: setLoading,
      onFail: (e: Error) => {
        notifyError(e);
        return true;
      },
    };

    logic.ready(update).catch((e: Error) => {
      notifyError(e);
      dispatch(readyUpdate(false));
    });
    logic.updateDefaultControlOpts({ ...defaultLogicProp, ...setting });

  }, [setting, update, dispatch, setLoading]);

  const timeOut: any = useRef(null);
  const isStatusReadyTimeout = useSelector(getIsStatusReadyTimeout);
  useEffect(() => {
    if (isStatusReady) {
      dispatch(setIsStatusReadyTimeout(false));
    }
    timeOut.current = setTimeout(() => {
      if (!isStatusReady) {
        dispatch(setIsStatusReadyTimeout(true));
        toast.info('cannotGetDevStatus');
      }
    }, 14000)
    return () => clearTimeout(timeOut.current);
  }, [dispatch, isStatusReady])

  const loading = useMemo(() => {
    // loading显示条件
    return (
      !isReady
      || isLoading
      || timerloading
      || !isStatusReady
    );
  }, [isReady,
    isLoading,
    isStatusReady,
    timerloading]);

  return (
    <React.Fragment>
      {loading && !isStatusReadyTimeout && (
        <Loading txt={intl('loading')} />
      )}
      {children}
    </React.Fragment>
  );
}
