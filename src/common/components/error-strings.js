import getI18nBundle from "@common/intl/get-i18n-bundle";
import { locale } from '@common/intl/LocaleProvider';
import jssdk from "jssdk";
import { isIOS } from "@common/util/device";

let errorStrings = null;

let language = '';

const getErrorString = async (errorCode) => {
    if (isIOS && !language) {
        const { language: appLang } = await jssdk.platformSDK.callNative('init');
        if (appLang) {
            console.warn('--get---app---Lang----', appLang, appLang?.toLowerCase()?.split('-')[0]);
            language = appLang.toLowerCase().split('-')[0];
        }
    }

    if (!errorStrings) {
        errorStrings = window.__ERRORS_STRINGS__ ? getI18nBundle(window.__ERRORS_STRINGS__, language || locale) : null;
    }
    console.log('------language------locale', language, locale);
    console.log('------errorStrings------', errorStrings);
    return errorStrings ? errorStrings[errorCode] : null
};
export default getErrorString 