interface Retry {
    errorCode: number
    retryCount: number
}

export interface CmdOptions {
    execDelayTimeout?: number;
    ignoreResponse?: boolean;
    retry?: Retry;
    updateStrategy?:'immediate'|'success'|'loop';
    onFail?:()=>void | false;
    onSuccess?:()=>void | false;
    restartLoopTimeout?: number
}

export interface Command {
    [propName: string]: any
}