import { configureStore } from '@reduxjs/toolkit';
// import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import devStateReducer from '@root/deviceStateSlice';
import globalReducer from '@root/globalSlice';
import timerReducer from '@panel/pages/timer/timerSlice';

// const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: {
    devState: devStateReducer,
    global: globalReducer,
    timer: timerReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat([
      // sagaMiddleware,
      logger,
    ]),
});
// sagaMiddleware.run(rootSaga);
export default store;
