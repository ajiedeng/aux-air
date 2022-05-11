/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';

import Slider from './Slider';

import './SliderKinds.css'

export default class extends React.PureComponent {

    constructor(props){
        super(props);
        this.state={
            isEnable:true
        };
    }

    enable=()=>{
        const {isEnable}=this.state;

        this.setState({
            isEnable:!isEnable
        },()=>{
            console.log(this.state.isEnable);
        });

    };

    render(){
        const {isEnable}=this.state;
        return (
            <div className="container">
                <div onClick={this.enable}>
                    {/*是否可用*/}
                </div>
                <div className={'platformKind platformFirst'}>国美平台</div>
                <Slider platform={'gome'} formatter={(value)=>value+'%'} showTicks={false} ticksLabels={["最低值","最高值"]} ticks={["0", "100"]}/>
                <Slider platform={'gome'} enabled={false} formatter={(value)=>value+'%'} showTicks={false} ticksLabels={["最低值","最高值"]} ticks={["0", "100"]}/>
                <Slider platform={'gome'} showTicks={true} tooltip="hide" ticksLabels={["0%", "25%", "50%", "75%", "100%"]} ticks={[0, 1, 2, 3, 4]}/>
                <Slider platform={'gome'} enabled={false} showTicks={true} tooltip="hide" ticksLabels={["0%", "25%", "50%", "75%", "100%"]} ticks={[0, 1, 2, 3, 4]}/>

                <div className={'platformKind'}>京东平台</div>
                <Slider platform={'jd'} showTicks={false} ticksLabels={["0%", "100%"]} ticks={[0, 100]} tooltip="hide"/>
                <Slider platform={'jd'} enabled={false} showTicks={false} ticksLabels={["0%", "100%"]} ticks={[0, 100]} tooltip="hide"/>
                <Slider platform={'jd'} showTicks={true} ticksLabels={["0%", "25%", "50%", "75%", "100%"]} ticks={[0, 1, 2, 3, 4]} tooltip="hide"/>
                <Slider platform={'jd'} enabled={false} showTicks={true} ticksLabels={["0%", "25%", "50%", "75%", "100%"]} ticks={[0, 1, 2, 3, 4]} tooltip="hide"/>

                <div className={'platformKind'}>智慧型平台</div>
                <Slider platform={'dna'} showTicks={false} ticksLabels={["最低值","最高值"]} ticks={["0", "100"]}/>
                <Slider platform={'dna'} enabled={false} showTicks={false} ticksLabels={["最低值","最高值"]} ticks={["0", "100"]}/>

                <Slider  showTicks={true} ticksLabels={["信息一","信息二","信息三","信息四"]} ticks={["0","100","200","300"]} tooltip="hide"/>
                <Slider  showTicks={true} enabled={false} ticksLabels={["信息一","信息二","信息三","信息四"]} ticks={["0","100","200","300"]} tooltip="hide"/>

                <Slider platform={'dna'} showTicks={true} ticksLabels={["信息一","信息二","信息三","信息四"]} ticks={["0","100","200","300"]} tooltip="hide" selection={false}/>
                <Slider platform={'dna'} enabled={false} showTicks={true} ticksLabels={["信息一","信息二","信息三","信息四"]} ticks={["0","100","200","300"]} tooltip="hide" selection={false}/>

                <Slider platform={'dna'} selection={false} showTicks={true} ticks={["0","100"]} ticksLabels={["信息一","信息二"]} tooltip="hide" enabled={isEnable} />
                <Slider platform={'dna'} enabled={false} selection={false} showTicks={true} ticks={["0","100"]} ticksLabels={["信息一","信息二"]} tooltip="hide" enabled={isEnable} />

                <Slider platform={'dna'} selection={false} type={Slider.COLORTEMP} ticksLabels={["信息一","信息二"]} />
                <Slider platform={'dna'} enabled={false} selection={false} type={Slider.COLORTEMP} ticksLabels={["信息一","信息二"]} />

                <div style={{background:'#FFAA00'}}>
                    <Slider platform={'dna'} showTicks={false} type={Slider.WHITING} ticksLabels={["最低值","最高值"]} ticks={["0", "100"]} selection={false}/>
                    <Slider platform={'dna'} enabled={false} showTicks={false} type={Slider.WHITING} ticksLabels={["最低值","最高值"]} ticks={["0", "100"]} selection={false}/>
                </div>

            </div>
        )
    }
}