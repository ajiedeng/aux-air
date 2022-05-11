import {
    Switch,
    Route,
    useRouteMatch,
} from 'react-router-dom';
import VacationMain from './main';
import ValidPeriod from './validPeriod';

export default function Vacation() {

    let { path, url } = useRouteMatch();
    console.log('path--url', path, url)
    return (
        <Switch>
            <Route path={`${path}/validPeriod/:timesType`} render={(props) => <ValidPeriod />} />
            <Route exact path={`${path}`} render={(props) => <VacationMain />} />
        </Switch>
    )
}
