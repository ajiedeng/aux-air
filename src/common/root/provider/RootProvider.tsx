import React from 'react';
import store from '../../store/index';
import { Provider } from 'react-redux';
import AutoLoopRoot from './AutoLoopRoot'
import LocaleProvider from '@common/intl/LocaleProvider';
import { Setting, ReactChildren } from './interface';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorBar from '@common/components/ErrorBar';


const setting: Setting = {
    timeout: 160000
}
export default function RootProvider({ children }: ReactChildren) {
    return (
        <Provider store={store}>
            <ErrorBoundary FallbackComponent={ErrorBar} onError={(err)=>console.log(err)}>
                <LocaleProvider>
                    <AutoLoopRoot setting={{ ...setting }}>
                        {children}
                    </AutoLoopRoot>
                </LocaleProvider>
            </ErrorBoundary>
        </Provider>)

}