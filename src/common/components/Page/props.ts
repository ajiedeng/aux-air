import { ReactNode } from "react";

export default interface Props {
    children:ReactNode,
    wholePage?: boolean,//整页面布局，该情况一般为导航栏作为背景渐变色的一部分，搭配导航栏透明背景色使用
    className?: string
}