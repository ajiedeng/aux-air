import * as React from 'react';

export interface IconInfo {
  icon: string,
  onClick?: () => void;
}
export interface Save {
  name: string,
  onSave: Function
}

export default interface Props {
  subtitle?: string; //副标题（房间）不传则不显示
  title?: string; //标题
  color?: string; //文字以及图标颜色
  exit?: boolean; //左键是否退出,true:退出,false:回退,默认false,只有首页才会退出
  right?: IconInfo | IconInfo[]; //按钮设置或者按钮设置数组
  opacity?: boolean; //是否透明 ture 透明 false 黑色
  className?: string; //自定义导航栏样式
  leftHandle?: Function; // 点击返回按钮事件
  save?: Save
}
