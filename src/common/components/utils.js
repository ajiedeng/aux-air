import moment from 'moment';
import Toast from './Toast';
import Modal from './Modal';
import getErrorString from "./error-strings";

moment.fn.toJSON = function () { return this.format("YYYY-MM-DD HH:mm:ss"); };

export const notifyError = async (e, modal) => {
    const message = (await getErrorString(e.code)) || e.msg || e.message || 'unknown error';

    if (modal) {
        Modal.alert(message);
    } else {
        Toast.info(message, 5000);
    }
    console.error(e)
}


export function formatNum(num) { //格式化数字
    if (num != null) {
        let str = num.toString();
        str = str.length > 1 ? str : '0' + str;
        return str;
    }
}

export const isEmpty = require('lodash/fp/isEmpty');
export const isEqual = require('lodash/fp/isEqual');
export const nextUid = require('lodash/fp/uniqueId');











