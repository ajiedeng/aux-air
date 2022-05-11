
import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import { FormattedMessage } from 'react-intl';
import style from './toast.module.scss';
import LocaleProvider from "@common/intl/LocaleProvider";

export default class Toast extends React.Component {

    static propTypes = {
        message: PropTypes.string,
        duration: PropTypes.number,
        image: PropTypes.string
    };

    static defaultProps = {
        duration: 3000
    };

    state = {
        show: true
    };

    componentDidMount() {

        $(this.el).fadeOut(this.props.duration, () => {
            $(this.el).parent().remove();
            this.setState({
                show: false
            });
        });
        $(this.el).css("margin-top", -($(this.el).outerHeight()) / 2);
    }

    render() {
        const { message, image } = this.props;

        if (!this.state.show) {
            return null;
        }
        return (
            <LocaleProvider>
                <div className={image ? style.box : style.toast} ref={el => this.el = el}>
                    {image && <div className={style.hook}><img src={image} alt="" /> </div>}
                    <div><FormattedMessage id={message}/></div>
                </div>
            </LocaleProvider>
        )
    }
}