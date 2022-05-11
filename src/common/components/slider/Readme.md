 ## DNA平台Slider使用

  ** usage **
  ~~~js
   import Slider from '../../Slider';

    <Slider
    platform={'dna'}
    enabled={true}
    selection={false}
    type={Slider.COLORTEMP}
    ticksLabels={["信息一","信息二"]} />

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

   <Slider
   platform={'dna'}
   enabled={true}
   showTicks={false}
   ticksLabels={["最低值","最高值"]}
   ticks={["0", "100"]}
   />

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

  <Slider
  platform={'dna'}
  enabled={true}
  selection={false}
  showTicks={true}
  ticks={["0","100"]}
  ticksLabels={["信息一","信息二"]}
  tooltip="hide"  />

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

    <Slider
    platform={'dna'}
    enabled={true}
    showTicks={false}
    type={Slider.WHITING}
    ticksLabels={["最低值","最高值"]}
    ticks={["0", "100"]}
    selection={false}/>

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

   <Slider
   platform={'dna'}
   enabled={true}
   showTicks={true}
   ticksLabels={["信息一","信息二","信息三","信息四"]}
   ticks={["0","100","200","300"]}
   tooltip="hide"/>

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

  <Slider
  platform={'dna'}
  enabled={true}
  showTicks={true}
  ticksLabels={["信息一","信息二","信息三","信息四"]}
  ticks={["0","100","200","300"]}
  tooltip="hide"
  selection={false}/>

  ~~~

 ## GOME平台Slider使用

  ** usage **
  ~~~js
   import Slider from '../../Slider';

   <Slider
    platform={'gome'}
    enabled={true}
    formatter={(value)=>value+'%'}
    showTicks={false}
    ticksLabels={["最低值","最高值"]}
    ticks={["0", "100"]}/>

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

   <Slider
   platform={'gome'}
   enabled={true}
   showTicks={true}
   tooltip="hide"
   ticksLabels={["0%", "25%", "50%", "75%", "100%"]}
   ticks={[0, 1, 2, 3, 4]}
   />

  ~~~


 ## JD平台Slider使用

  ** usage **
  ~~~js
   import Slider from '../../Slider';

   <Slider
   platform={'jd'}
   enabled={true}
   showTicks={false}
   ticksLabels={["0%", "100%"]}
   ticks={[0, 100]}
   tooltip={"hide"}
   />

  ~~~

  ** usage **
  ~~~js
   import Slider from '../../Slider';

   <Slider
   platform={'jd'}
   enabled={true}
   showTicks={true}
   ticksLabels={["0%", "25%", "50%", "75%", "100%"]}
   ticks={[0, 1, 2, 3, 4]}
   tooltip="hide"
   />


  ~~~

