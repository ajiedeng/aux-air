import { createSlice, createSelector } from '@reduxjs/toolkit'

export const deviceStateSlice = createSlice({
  name: 'devState',
  initialState: {
    status: {},
    online: '2',
    name: '',
    deviceID: '',
  },
  reducers: {
    updateDevState: (state: any, action) => {
      const { status, online, name, deviceID } = action.payload;
      state.status = { ...state.status, ...status };
      online !== undefined && (state.online = online);
      name !== undefined && (state.name = name);
      deviceID !== undefined && (state.deviceID = deviceID);
      // Object.assign(state, action.payload);
    },
    websocketUpdateDevState: (state: any, action) => {
      const { status } = state;
      state.status = { ...status, ...action.payload }
    },
  },
});

export default deviceStateSlice.reducer;

export const { updateDevState, websocketUpdateDevState } = deviceStateSlice.actions;

export const getOnline = (state: any) => state.devState.online;
export const getName = (state: any) => state.devState.name;
export const getDeviceID = (state: any) => state.devState.deviceID;
export const getStatus = (state: any, params: any) => {
  const status = state.devState.status;
  if (!params) {
    //不传则返回全部
    return status && { ...status };
  } else if (Array.isArray(params)) {
    const result: any = {};
    params.forEach((p) => (result[p] = status[p]));
    return result;
  } else {
    return status[params];
  }
};

export const getKeyValMap = (state: any) => state.devState.status;

export const getStatusReady = createSelector(
  [getOnline, getKeyValMap],
  (online: string, status: any) => {
    return online === '1' || online === '2'
      ? status && Object.keys(status).length > 0
      : online === '0' || online === '3';
  }
);

export const getIsOnline = createSelector(
  [getOnline],
  (online: string) => online === '1' || online === '2'
);
