
export default interface Props {
    des?:string,
    onCancel?:()=>void,
    onClose?:()=>void,
    onCertain:(val:string)=>void,
    type?:'input' | 'text',
    ctx?: string,
    show: boolean
}