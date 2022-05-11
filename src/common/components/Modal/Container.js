import React from 'react';
import Modal from './Modal';
import LocaleProvider from '@common/intl/LocaleProvider';

export default class Container extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            modals: {}
        };
        this.addModal = this.addModal.bind(this);
        this.removeModal = this.removeModal.bind(this);
    }


    addModal (props) {
        const { modals } = this.state;
        modals[props.id] = props;

        this.setState({modals:modals})
    }

    removeModal (id,callStaticOnClose = true) {
        const { modals } = this.state;
        const props = modals[id];
        if (!props) { return }

        props.onClose && props.onClose();

        callStaticOnClose && props.staticOnClose && props.staticOnClose();

        this.setState((prevState, props) => {

            delete prevState.modals[id];

            // if (!newModals || Object.keys(newModals).length===0) {
            //     document.body.style.height = '';
            //     document.body.style.overflow = '';
            // }

            return {...prevState};
        });



    }


    render() {
        const {modals} = this.state;
        return (
            <LocaleProvider>
                <div>
                    {  Object.keys(modals).map((key, i) => {
                        const props = modals[key];
                        return <Modal key={key} {...props} index={i} onClose={this.removeModal}/>
                    })}
                </div>
            </LocaleProvider>
        )
    }

}