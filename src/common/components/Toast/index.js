import React from 'react';
import ReactDOM from 'react-dom'

import Toast from './Toast'
import hookIcon from './images/hook.svg'


let createContainer=function (message,duration,image) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    ReactDOM.render(<Toast message={message} image={image} duration={duration}/>, div);
};
/*
* message 可以为message id或者普通字符串
* */
const info = function (message,duration) {
    createContainer(message,duration)
};
const success = function (message,duration) {
    createContainer(message,duration,hookIcon)
};
const T = {
    info,success
}
export default  T

