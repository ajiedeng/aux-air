import { ReactNode } from "react";

export default interface Props {
    children: ReactNode;
    clickAway?: boolean;
    title?: string;
    cancelTxt?: string;
    saveTxt?: string;
    onClose?: () => void;
    show: boolean;
    onCancel: () => void;
    onSave: () => void;
}