import React from 'react';
import ReactDOM from 'react-dom'
import Container from './Container'
import proxy from './Proxy'
import { nextUid } from '../utils'

const div = document.createElement('div');
document.body.appendChild(div);
const container = ReactDOM.render(<Container />, div);


let staticOnOpen,staticOnClose;

const cache  = {};

const open = function(options){
    const id = options.id || nextUid();

    container.addModal({...options,id,staticOnClose});

    if(!cache[id]){
        cache[id] = true;
        staticOnOpen && staticOnOpen(id);
    }
    return id;
};

const close = function(id,callStaticOnClose){
    if(cache[id]){
        container.removeModal(id,callStaticOnClose);
        delete cache[id];
    }
};

const alert = function(content,callback = true){
    open({
        content,
        buttons:{
            'internal.Modal.confirm':callback
        },
        type:'alert'
    });
};

const confirm = function(content,confirm=true,cancel=true){
    open({
        content,
        buttons:{
            'internal.Modal.cancel':cancel,
            'internal.Modal.confirm':confirm
        },
        type:'alert'
    });
};

const Modal = proxy(open,close);

Modal.open = open;
Modal.alert = alert;
Modal.confirm = confirm;
Modal.close = close;

Modal.onOpen = (fn)=>{
    staticOnOpen = fn;
};
Modal.onClose = (fn)=>{
    staticOnClose = fn;
};

export default Modal;