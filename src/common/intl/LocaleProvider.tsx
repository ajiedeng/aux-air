/*
 * @Author: ajie.deng
 * @Date: 2022-03-18 16:52:21
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-25 15:16:53
 * @FilePath: \smart_dimmer_developf:\Code\aux-air1\src\common\intl\LocaleProvider.js
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
import { IntlProvider } from 'react-intl'
import { useCallback, useState } from 'react'
import getI18nBundle, { browserLocale } from './get-i18n-bundle';
import jssdk from 'jssdk'



/*
 汉语、英语、日语、韩语、法语、西班牙语、葡萄牙语、俄罗斯语、阿拉伯语、德语、印地语
*/
import '@formatjs/intl-locale/polyfill'
import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/locale-data/en' // locale-data for en
import '@formatjs/intl-pluralrules/locale-data/zh' // locale-data for zh
import '@formatjs/intl-pluralrules/locale-data/ar' //阿拉伯语
import '@formatjs/intl-pluralrules/locale-data/ru' //俄语
import '@formatjs/intl-pluralrules/locale-data/ro' //罗马尼亚语
import '@formatjs/intl-pluralrules/locale-data/pt' //葡萄牙语
import '@formatjs/intl-pluralrules/locale-data/th' //泰语
import '@formatjs/intl-pluralrules/locale-data/tr' //土耳其语
import '@formatjs/intl-pluralrules/locale-data/es' //西班牙语
import '@formatjs/intl-pluralrules/locale-data/ja' //日语
import '@formatjs/intl-pluralrules/locale-data/el' //希腊语
import '@formatjs/intl-pluralrules/locale-data/it' //意大利语
import '@formatjs/intl-pluralrules/locale-data/id' //印尼语


import '@formatjs/intl-pluralrules/locale-data/vi' //越南语
import '@formatjs/intl-pluralrules/locale-data/pl' //波兰语
import '@formatjs/intl-pluralrules/locale-data/sr' //塞尔维亚语
import '@formatjs/intl-pluralrules/locale-data/hu' //匈牙利语
import '@formatjs/intl-pluralrules/locale-data/cs' //捷克语
import { useEffect } from 'react';


export const locale = (() => {
    const language = browserLocale.toLowerCase().split('-')[0];
    return language || 'en';
})();

const LocaleProvider = ({ children, defaultLocale = 'en' }: any) => {
    const onError = (e: any) => {
        console.log(`${e.code}+${e.descriptor.id}`);
    }
    const [Locale, setLocale] = useState(locale);
    console.warn(`current browser language: ${browserLocale},choose '${Locale}' as app language`);
    const messages = getI18nBundle((window as any).__APP_STRINGS__, Locale);
    const init = useCallback(async () => {
        const { language: appLang } = await jssdk.platformSDK.callNative('init');
        if (appLang) {
            console.warn('--get---app---Lang----', appLang, appLang?.toLowerCase()?.split('-')[0]);
            setLocale(appLang.toLowerCase().split('-')[0]);
        }
    }, [])
    useEffect(() => {
        init();
    }, [init])
    return (
        <IntlProvider onError={onError} locale={Locale} defaultLocale={defaultLocale} messages={messages}>
            {children}
        </IntlProvider>
    );
};

export default LocaleProvider