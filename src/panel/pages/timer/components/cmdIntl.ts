const cmdIntl = {
    ac_pwr: {
        0: 'closeAir',
        1: 'openAir'
    },
    hp_fast_hotwater: {
        0: 'wh',
        1: 'wh'
    },
    hp_pwr: {
        0: 'closeWh',
        1: 'openWh'
    },
    ac_mode: {
        1: 'cold',
        4: 'hot'
    },
};
type CmdKeys = 'ac_pwr' | 'hp_pwr' | 'ac_mode';
export const parseCmd = (cmd: { ac_pwr: 0 | 1, hp_pwr: 0 | 1, ac_mode: 1 | 4, }) => {
    return Object.keys(cmd)
        .filter(key => Object.keys(cmdIntl).includes(key))
        .map((key) => (cmdIntl[key as CmdKeys] as any)[cmd[key as CmdKeys]])
}
export default cmdIntl;
