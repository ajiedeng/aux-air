/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import { snakeCase } from 'change-case';
import '../libs/boostrap-slider/bootstrap-slider.css'
import './slider.css'
import style from './theme.module.scss'
import Slider from '../libs/boostrap-slider/bootstrap-slider';
import $ from 'jquery'

const DElAY_UPDATE_TIMEOUT = 10000; //毫秒级别

export default class extends React.PureComponent {
    static COLORTEMP = 'colortemp';   //色温类型
    static WHITING = 'whiting';   //泛白类型
    static DNA = 'dna';
    static JD = 'jd';
    static GOME = 'gome';

    /*initial properties*/
    static propTypes = {
        platform: PropTypes.oneOf(["dna", "jd", 'gome']),
        type: PropTypes.oneOf(["colortemp", "whiting"]),  //类型:色温、泛白
        value: PropTypes.oneOfType([ //默认值
            PropTypes.array,
            PropTypes.number
        ]),
        min: PropTypes.number,   //最小值
        max: PropTypes.number,   //最大值
        unit: PropTypes.string,  //单位
        step: PropTypes.number,  //步长
        tooltip: PropTypes.oneOf(["show", "hide", "always"]),   //是否显示提示信息
        enabled: PropTypes.bool, //是否可用，默认为true
        ticks: PropTypes.array,  //刻度的value
        ticksLabels: PropTypes.array,    //刻度对应的标签
        change: PropTypes.func,    //拖动滑块事件
        slideStop: PropTypes.func,   //停止拖动滑块事件

        /*add properties*/
        showTicks: PropTypes.bool,    //多个刻度时是否显示刻度手柄
        selection: PropTypes.bool,   //已滑过部分是否显示颜色
        selectionColor: PropTypes.string,  //自定义已滑过部分颜色,默认为主题色

        delayUpdate: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.number
        ]),   //滑动过后延迟更新slider，即使value 属性有变化
    };

    static defaultProps = {
        min: 1,
        max: 100,
        value: 50,
        step: 1,
        handle: 'round',
        tooltip: 'hide',
        enabled: true,
        ticks: [1, 100],
        ticksLabels: ['', ''],
        showTicks: false,
        selection: true,
        platform: 'dna',
        selectionColor: '#FF5349'
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const slider = this.slider;
        const variable = {
            value: value => {
                if (!this.moving) {
                    //在未拖动的情况下才可以更新
                    slider.setValue(value)
                }
            },
            enabled: enabled => {
                enabled ? slider.enable() : slider.disable();
                this.slideStyle(this.el, this.props);
            }
        };
        Object.keys(variable).forEach(prop => {
            if (this.props[prop] !== prevProps[prop] && prevProps[prop] != null) {
                variable[prop](this.props[prop]);
            }
        });
    }

    componentDidMount() {
        const { slide, slideStart, slideStop, change, slideEnabled, slideDisabled, unit, delayUpdate, ...config } = this.props;
        const options = {};
        Object.keys(config).forEach(prop => { //将属性骆峰规则转化成下划线
            options[snakeCase(prop)] = this.props[prop];
        });

        this.slider = new Slider(this.el, {
            formatter: function (value) {   //显示提示信息，如果有单位则显示单位
                return unit ? value + unit : value;
            },
            ...options
        });

        const events = {
            slide, slideStart, slideStop, change, slideEnabled, slideDisabled
        };
        const warpHandler = {
            slide: () => {
                clearTimeout(this.resetMovingTimeoutId);
                this.moving = true;
            },
            slideStart: () => {
                clearTimeout(this.resetMovingTimeoutId);
                this.moving = true;
            },
            slideStop: () => {
                if (delayUpdate) {
                    let time = parseInt(delayUpdate);
                    this.resetMovingTimeoutId = setTimeout(() => {
                        this.moving = false;
                        this.slider.setValue(this.props.value);
                    }, isNaN(time) ? DElAY_UPDATE_TIMEOUT : time);
                } else {
                    this.moving = false;
                }
            }
        };
        Object.keys(events).forEach(e => {    //监听滑块事件
            if (warpHandler[e]) {
                this.slider.on(e, (...args) => {
                    warpHandler[e]();
                    events[e] && events[e].apply(null, args)
                });
            } else if (events[e]) {
                this.slider.on(e, events[e]);
            }
        });

        this.slideStyle(this.el, this.props);//修改滑块样式

    }

    componentWillUnmount() {
        this.slider.destroy();
    }

    slideStyle = (el, props) => {    //设置滑块样式
        const { type, selection, showTicks, enabled, selectionColor, platform } = props;
        const backgroundImage = '-webkit-gradient(linear,left top,left bottom,from(' + selectionColor + '),to(' + selectionColor + '))';
        const borderColor = '0.03125rem solid ' + selectionColor + '';
        $(el).parent().find(".tooltip-inner").addClass(style.tooltipInner);

        if (platform === 'dna' || platform === 'gome') {//dna平台
            if (selection) {  // 已滑过部分显示颜色
                if (selectionColor) {
                    $(el).parent().find(".slider-selection.tick-slider-selection").css('background-image', backgroundImage);  //已滑过部分颜色
                    $(el).parent().find(".slider-handle").css('border', borderColor);//滑柄颜色
                    $(el).parent().find(".tooltip-inner").css('color', selectionColor);
                } else {
                    $(el).parent().find(".slider-selection.tick-slider-selection").addClass(style.selectionStyle);  //已滑过部分颜色
                    $(el).parent().find(".slider-handle").addClass(style.sliderHandle); //滑柄颜色
                }

            } else {
                $(el).parent().find(".slider-selection.tick-slider-selection").addClass(style.backTransparent); //已滑过部分颜色
                $(el).parent().find(".slider-handle").addClass(style.backTransparent);  //滑柄颜色
            }
        } else {//jd 平台
            if (selection) {  // 已滑过部分显示颜色
                if (selectionColor) {
                    if (showTicks) {
                        $(el).parent().find(".slider-selection.tick-slider-selection").css('background-image', backgroundImage);  //已滑过部分颜色
                        $(el).parent().find(".slider-track-high").css('background-image', backgroundImage); //未滑过的颜色
                        $(el).parent().find(".slider-tick.round").css('background-image', backgroundImage); //slider-tick的颜色
                        // $(el).parent().find(".slider-handle").css('border',borderColor);//滑柄颜色
                        $(el).parent().find(".tooltip-inner").css('color', selectionColor);
                    } else {
                        $(el).parent().find(".slider-selection.tick-slider-selection").css('background-image', backgroundImage);  //已滑过部分颜色
                        // $(el).parent().find(".slider-handle").css('border',borderColor);//滑柄颜色
                        $(el).parent().find(".tooltip-inner").css('color', selectionColor);
                    }
                } else {
                    if (showTicks) {
                        $(el).parent().find(".slider-selection.tick-slider-selection").addClass(style.selectionStyle);  //已滑过部分颜色
                        $(el).parent().find(".slider-track-high").addClass(style.jd_unSelected); //未滑过的颜色
                        $(el).parent().find(".slider-tick.round").addClass(style.jd_slider_ticks); //slider-tick的颜色
                        $(el).parent().find(".slider-handle").addClass(style.jd_sliderHandle);//滑柄颜色
                    } else {
                        $(el).parent().find(".slider-selection.tick-slider-selection").addClass(style.selectionStyle);  //已滑过部分颜色
                        $(el).parent().find(".slider-handle").addClass(style.jd_sliderHandle); //滑柄颜色
                    }
                }

            } else {
                $(el).parent().find(".slider-selection.tick-slider-selection").addClass(style.backTransparent); //已滑过部分颜色
                $(el).parent().find(".slider-handle").addClass(style.backTransparent);  //滑柄颜色
            }


        }


        if (!enabled) {   //滑块不可用
            $(el).parent().addClass("disabled");
        } else {
            $(el).parent().removeClass("disabled");
        }

        if (showTicks === false) {    //不显示label对应的ticks
            $(el).parent().find(".slider-tick").css("display", 'none');
        }
        if (showTicks === true) {    //显示label对应的ticks
            $(el).parent().find(".slider-track").css("width", '102%');
        }
        if (type && type === 'colortemp') {    //色温组件
            $(el).parent().addClass('colorTemp');
        }

        if (type && type === 'whiting') {   //泛白滑块组件
            $(el).parent().addClass('Whiting');
            $(el).parent().find(".slider-handle").addClass('handleStyle');  //滑柄颜色
        }
    };

    setValue = (value) => {  //设置插件value
        this.slider.setValue(value);
    };

    //不要添加data-provide属性,作用同new Slider
    render() {
        return (
            <div className={this.props.platform + '_sliderLight'}>
                <input ref={el => this.el = el} type="text" />
            </div>
        )
    }
}
