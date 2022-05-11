import { nextUid } from '../utils';
import React from 'react';

export default function Proxy (open, close) {

    return class extends React.PureComponent {

        static defaultProps = {
            isOpen:true
        };

        constructor (props) {
            super(props);
            //内部生产ID，防止重复添加
            this.id = nextUid()
        }

        componentDidMount () {
            if (this.props.isOpen) {
                this.renderModal(this.props);
            }
        }

        componentWillUpdate(nextProps, nextState){
            if (!nextProps.isOpen && !this.props.isOpen) {
                return;
            }

            if (nextProps.isOpen) {
                this.renderModal(nextProps);
            } else {
                close(this.id);
            }

        }


        componentWillReceiveProps (nextProps) {

        }

        componentWillUnmount () {
            close(this.id);
        }


        renderModal (props) {
            open({
                id: this.id,
                content: props.children,
                ...props
            })
        }

        render () {
            return <noscript></noscript>
        }

    }
}