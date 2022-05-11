import React from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery'
import moment from 'moment'
import  '../libs/mobiscroll/mobiscroll.2.13.2'
import  '../libs/mobiscroll/mobiscroll.2.13.2.css'
import { injectIntl } from 'react-intl';
const FORMAT='HH:mm:ss';    //格式化时间样式
/*
本插件基于mobiscroll封装，所有mobiscroll date&time组件支持的参数，本组件都支持。
参考文档: https://docs.mobiscroll.com/2-17-3/jquery/datetime

额外提供的功能在propTypes列出
* */
export default injectIntl(class extends React.Component {
    static propTypes = {
        type:PropTypes.oneOf(['time', 'date','datetime']),
        defaultValue:PropTypes.object,//moment or moment.duration
        onChange:PropTypes.func,
        min:PropTypes.object,   //最小值 moment or moment.duration
        max:PropTypes.object,   //最大值 moment or moment.duration
        isDuration:PropTypes.bool  //是否为时间段
    };

    static defaultProps = {
        type:'time',
        defaultValue:moment()
    };

    componentDidMount(){    
        this.handleChange = this.handleChange.bind(this);
        const {defaultValue,type,min,max,isDuration,onChange,intl:{formatMessage},...passthrough} = this.props;

        const dpr={
            '1':43,
            '2':85,
            '3':129
        };
        const height = dpr[$("html").attr("data-dpr")]||50;
        console.log('--picker-height-----',height)

        const config = {
            theme: 'android-ics light', //皮肤样式
            display: 'inline', //显示方式 Inline
            dateFormat:"yymmdd",
            timeFormat:"HHiiss",
            onChange: this.handleChange,
	        height:height,
            timeWheels: "HHii",
            dateOrder: 'mmdd',
            defaultValue:moment.isDuration(defaultValue)?
                moment({hour:defaultValue.hours(),minute :defaultValue.minutes()}).toDate():
                defaultValue.toDate(),
            ...passthrough,
        };
        const length = {'2':"oneColumn",'4':"twoColumn",'6':"threeColumn"};
        if(type === 'time'){
            let cssClass = length[config.timeWheels.length+''];
            let hourText,minuteText;    //分情况显示时或小时
            if(isDuration){   //时间段
                hourText=formatMessage({id:'internal.TimePicker.unitHour'},{type:'duration'});
                minuteText=formatMessage({id:'internal.TimePicker.unitMinute'},{type:'duration'});
            }else { //时间点
                hourText=formatMessage({id:'internal.TimePicker.unitHour'},{type: 'point'});
                minuteText=formatMessage({id:'internal.TimePicker.unitMinute'},{type: 'point'});
            }
            $(this.el).mobiscroll().time({
                ...config,
                hourText:hourText,
                minuteText:minuteText,
                invalid:this.formatInvalid(min,max),
                cssClass
            });
        }else if(type === 'date'){
            let cssClass = length[config.dateOrder.length+''];
            $(this.el).mobiscroll().date({
                ...config,
                cssClass,
                maxDate: max && max.toDate(),
            });
        }
        //不应该默认调用一次onchange
        // this.handleChange && this.handleChange(null,defaultValue)
    }

    componentWillUnmount() {
        const inst =$(this.el).mobiscroll("getInst");
        if(inst && inst.destroy){
            inst.destroy();
        }
    }

    handleChange(valueText, inst){

        let date = moment.isMoment(inst)?inst:moment(inst.getDate());

        const {isDuration}=this.props;
        if(isDuration){  //如果为时间段，则返回duration格式为minutes
            date=moment.duration(date.hours()*60+date.minutes(),"minutes");
        }
        this.props.onChange && this.props.onChange(date);
    }

    formatInvalid=(min,max)=> {    //获得无效时间段
        const {isDuration}=this.props;
        let invalid = [];

        if (isDuration) {
            let minDuration = min || moment.duration(1, "minutes");
            //maxDuration 的默认值设为24小时的时候会默认为0
            let maxDuration = max || moment.duration({ seconds: 0,minutes: 59,hours: 23});
            //转为时间点统一处理
            [min, max] = [minDuration, maxDuration].map(duration => moment({
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds:duration.seconds()
            }));
            if (max.isBefore(min)) {
                console.warn('minDuration is bigger than maxDuration,we will switch those two');
                [min, max] = [max, min];
            }
        } else {
            min = min || moment().startOf('day');
            max = max || moment().endOf('day');
        }


        if ((min.isBefore(moment().endOf('day')) || (min.isAfter(moment().endOf('day'))&&max.isAfter(moment().endOf('day'))) ) && !isDuration) {
            invalid.push({
                start: max.format(FORMAT),
                end: min.format(FORMAT)
            });
        } else {
            if (moment().startOf('day').isBefore(min)) {    //判断最小值是否小于最小时间点，
                invalid.push({
                    start: moment().startOf('day').format(FORMAT),
                    end: min.format(FORMAT)
                });
            }
            if (max.isBefore(moment().endOf('day'))) {  //判断最大值是否大于最大时间点，
                invalid.push({
                    start: max.format(FORMAT),
                    end: moment().endOf('day').format(FORMAT)
                });
            }
        }
        return invalid;
    };

    render() {

        return(
            <div ref={el => this.el = el}>

            </div>
        )
    }
})
