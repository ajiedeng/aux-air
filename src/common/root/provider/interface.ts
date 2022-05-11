import { ReactNode } from 'react';

export interface Setting {
    timeout: number,
    isGroup?: boolean
}

export interface ReactChildren {
    children: ReactNode
}

export interface AutoLoopRootProps extends ReactChildren {
    setting: Setting
}
