import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import jssdk from 'jssdk';
import { statusBarHeight, ratio } from '@util/device';


const { platformSDK } = jssdk;
export const getStatusBar: any = createAsyncThunk(
  'global/getStatusBar',
  async () => {
    return await platformSDK.callNative('getSystemSettings');
  }
);
export const getAppSetting: any = createAsyncThunk(
  'global/getAppSetting',
  async () => {
    return await platformSDK.callNative('getAppSettings');
  }
);
export const getUserInfo: any = createAsyncThunk(
  'global/getUserInfo',
  async () => {
    return await platformSDK.callNative('getUserInfo');
  }
);
export const getFamilyInfo: any = createAsyncThunk(
  'global/getFamilyInfo',
  async () => {
    return await platformSDK.callNative('getFamilyInfo');
  }
);
interface GlobalStateType {
  ready: boolean,
  loading: boolean,
  controlling: boolean,
  userId: string,
  loginSession: string,
  familyId: string,
  statusBarHeight: string,
  curDev: 'ac' | 'wh',//'ac'代表当前处于空调设置，'wh'代表当前处于热水设置
  tempUnit: 'C' | 'F',
  isStatusReadyTimeout: boolean
}

export const globalSlice = createSlice({
  name: 'global',
  initialState: {
    ready: false,
    loading: false,
    controlling: false,
    userId: '',
    loginSession: '',
    familyId: '',
    statusBarHeight: statusBarHeight + 'px',
    curDev: 'ac',
    tempUnit: 'C',
    isStatusReadyTimeout: false
  } as GlobalStateType,
  reducers: {
    loadingUpdate: (state: any, action) => {
      state.loading = action.payload;
    },
    controllingUpdate: (state: any, action) => {
      state.controlling = action.payload;
    },
    setIsStatusReadyTimeout: (state: any, action) => {
      state.isStatusReadyTimeout = action.payload;
    },
    readyUpdate: (state: any, action) => {
      state.ready = action.payload;
    },
    curDevSet: (state: any, action) => {
      state.curDev = action.payload;
    },
  },
  extraReducers: {
    [getStatusBar.fulfilled]: (state, action) => {
      if (!action.payload) return;
      const { statusBarHeight } = action.payload;
      console.log('statusBarHeight====window.devicePixelRatio', statusBarHeight, ratio);
      if (statusBarHeight) {
        state.statusBarHeight = (statusBarHeight / ratio) + 'px';
      }
    },
    [getAppSetting.fulfilled]: (state, action) => {
      const { tempUnit } = action.payload;
      console.log('tempUnit', tempUnit);
      state.tempUnit = tempUnit;
    },
    [getUserInfo.fulfilled]: (state, action) => {
      const { userId, loginSession } = action.payload;
      state.userId = userId;
      state.loginSession = loginSession;
    },
    [getFamilyInfo.fulfilled]: (state, action) => {
      const { familyId } = action.payload;
      state.familyId = familyId;
    }
  },
});

export default globalSlice.reducer;

export const { loadingUpdate, readyUpdate, curDevSet, setIsStatusReadyTimeout, controllingUpdate } = globalSlice.actions;

interface State {
  global: GlobalStateType
}

export const getReady = (state: State) => state.global.ready;

export const getLoading = (state: State) => state.global.loading;

export const getControlling = (state: State) => state.global.controlling;

export const getCurDev = (state: State) => state.global.curDev;

export const getTempUnit = (state: State) => state.global.tempUnit;

export const getIsDC = createSelector([getTempUnit], tempUnit => tempUnit === 'C');

export const getFamilyId = (state: State) => state.global.familyId;

export const getUserId = (state: State) => state.global.userId;

export const getIsStatusReadyTimeout = (state: State) => state.global.isStatusReadyTimeout;
