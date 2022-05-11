import { useCallback, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { control } from '@root/logic';
import { Command, CmdOptions } from './props';
import { getKeyValMap } from '@root/deviceStateSlice';
import { getCurDev, curDevSet } from '@common/root/globalSlice';
export const useControl = () => {
  return useCallback((cmd: Command, opt?: CmdOptions) => control(cmd, opt), []);
};

export const useFormatMessage = () => {
  const { formatMessage } = useIntl();
  const _formatMessage = useCallback(
    (id: string) => formatMessage({ id }),
    [formatMessage]
  );
  return _formatMessage;
};

export const useDevState = () => {
  return useSelector(getKeyValMap);
};

interface UseToggle {
  (initialState: boolean): [boolean, (forceVal?: boolean) => void];
}

export const useToggle: UseToggle = (initialState: boolean) => {
  const [state, setstate] = useState(initialState || false);
  const toggle = useCallback(
    (forceVal?: boolean) => {
      setstate(typeof forceVal !== 'boolean' ? !state : forceVal);
    },
    [state]
  );
  return [state, toggle as any];
};

type CurMode = 'ac' | 'wh';
export const useCurDev = () => {
  const _get = useSelector(getCurDev);
  const dispatch = useDispatch();
  const _set = useCallback((curDevMode: CurMode) => { dispatch(curDevSet(curDevMode)) }, [dispatch])
  const curDev =  useMemo(()=>[_get, _set] as [CurMode, typeof _set],[_get, _set])
  return curDev
}
