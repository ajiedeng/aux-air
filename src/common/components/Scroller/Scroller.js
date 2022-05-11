/*
 * @Author: ajie.deng
 * @Date: 2022-03-07 10:23:38
 * @LastEditors: ajie.deng
 * @LastEditTime: 2022-03-07 16:01:16
 * @FilePath: \aux-air\src\common\components\Scroller\Scroller.js
 * @Description: 
 * 
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved. 
 */
/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';
import  '../libs/mobiscroll/mobiscroll.2.13.2'
import  '../libs/mobiscroll/mobiscroll.2.13.2.css'

/*
* https://docs.mobiscroll.com/2-17-3/jquery/scroller
* */
export default class extends React.Component {
    static propTypes = {
        // defaultValue:PropTypes.string,
        onChange:PropTypes.func
    };

    static defaultProps = {
    };

    componentDidMount(){
        console.error(this.props)
        this.handleChange = this.handleChange.bind(this);
        const {defaultValue,onChange,...passthrough} = this.props;

        const dpr={
            '1':43,
            '2':85,
            '3':129
        };
        const height = dpr[$("html").attr("data-dpr")]||50;

        const config = {
            theme: 'android-ics light', //皮肤样式
            display: 'inline', //显示方式 Inline
            onChange: this.handleChange,
            height:25,
            wheels: [
                [{
                    label: 'h',
                    values: ['0', '1', '2', '3', '4', '5', '6', '7']
                }]
            ],
            width: 20,
            ...passthrough
        };
        const length = {'1':"oneColumn",'2':"twoColumn",'3':"threeColumn"};
        let cssClass = length[config.wheels[0].length+''];

        $(this.el).mobiscroll().scroller({
            ...config,cssClass
        });

        if (this.props.defaultValue) {
            $(this.el).mobiscroll('setValue', this.props.defaultValue)
        }
    }

    componentWillUnmount() {
        const inst =$(this.el).mobiscroll("getInst");
        if(inst && inst.destroy){
            inst.destroy();
        }
    }

    handleChange(valueText, inst){
        console.error('valueText:'+valueText)
        this.props.onChange && this.props.onChange(valueText);
    }


    render() {

        return(
            <div ref={el => this.el = el}>

            </div>
        )
    }
}
