import isMobile from 'ismobilejs';
export const isIOS = isMobile(window.navigator).apple.device;

export const ratio = window.devicePixelRatio || 1;

// Define the users device screen dimensions
const screen = {
    width : window.screen.width * ratio,
    height : window.screen.height * ratio
};

export const isIphoneX =
    isIOS && (
        (screen.width === 1125 && screen.height === 2436)   //iphoneX
        ||
        (screen.width === 828 && screen.height === 1792)    //iphoneXR
        ||
        (screen.width === 1125 && screen.height === 2436)    //iphoneXS
        ||
        (screen.width === 1242 && screen.height === 2688)   //iphoneXSMAX
        ||
        (screen.width === 828 && screen.height === 1792)   //iphone 11
        ||
        (screen.width === 1125 && screen.height === 2436)   //iphone 11 Pro
        ||
        (screen.width === 1242 && screen.height === 2688)   //iphone 11 Pro Max
        ||
        (screen.width === 1080  && screen.height === 2340 )   //iphone 12 mini
        ||
        (screen.width === 1170  && screen.height === 2532 )   //iphone 12 / iphone 12 Pro
        ||
        (screen.width === 1284 && screen.height === 2778)   //iphone 12 Pro Max 2778 x 1284
    ); // 刘海屏+虚拟home按键的iphone版本


    /*
 设备 	分辨率 	PPI 	状态栏高度 	导航栏高度 	标签栏高度

 iPhone X
 1125×2436 px 	458PPI 	88px 	176px 	--

 iPhone6P、6SP、7P、8P
 1242×2208 px 	401PPI 	60px 	132px 	146px

 iPhone6 - 6S - 7
 750×1334 px 	326PPI 	40px 	88px 	98px

 iPhone5 - 5C - 5S
 640×1136 px 	326PPI 	40px 	88px 	98px

 iPhone4 - 4S
 640×960 px 	326PPI 	40px 	88px 	98px

 iPhone & iPod Touch第一代、第二代、第三代
 320×480 px 	163PPI 	20px 	44px 	49px

* */
export const statusBarHeight = (function () {
    let height;
    if(isIOS){
        if(screen.width === 1125 && screen.height === 2436){
            height = 30;
        }else if(screen.width === 1242 && screen.height === 2208 ){
            height = 20;
        }else if(screen.width === 750 && screen.height === 1334 ){
            height = 20;
        }else if(screen.width === 640 && screen.height === 1136 ){
            height = 20;
        }else if(screen.width === 640 && screen.height === 960 ){
            height = 20;
        }else{
            height = 30;
        }
    }else {
        if(screen.width === 1442 && screen.height === 2562 ){
            height=28;
        }else if(screen.width === 1080.75 && screen.height === 2244 ){
            height = 33;
        }else{
            height = 20;
        }
    }
    return height;
})();
