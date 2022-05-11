import {
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom';
import TimerList from './timerList';
import CmdSetting from './cmdSetting';
import TimerSetting from './timerSetting';
import RepeatSetting from './repeatSetting';
import CustomRepeat from './customRepeat';

export default function Timer() {

    let { path, url } = useRouteMatch();
    console.log('path--url', path, url)
    return (
        <Switch>
            <Route path={`${path}/timerSetting/:type`} render={(props) => <TimerSetting />} />
            <Route path={`${path}/cmdSetting/:timeType`} render={(props) => <CmdSetting />} />
            <Route path={`${path}/customRepeat`} render={(props) => <CustomRepeat />} />
            <Route path={`${path}/repeatSetting`} render={(props) => <RepeatSetting />} />
            <Route exact path={`${path}`} render={(props) => <TimerList />} />
        </Switch>
    )
}
