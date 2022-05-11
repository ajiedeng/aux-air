import React from 'react';
import {
  Switch,
  Route,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Main from './pages/main';
import ECO from './pages/eco';
import Mute from './pages/mute';
import Vacation from './pages/vacation';
import Timer from './pages/timer';
import TimeInterval from './pages/interval'

const ANIMATION_MAP = {
  PUSH: 'enter',
  POP: 'exit',
  REPLACE: 'exit',
};
function App() {
  const location = useLocation();
  const history = useHistory();
  return (
    <TransitionGroup
      childFactory={(child) => {
        return React.cloneElement(child, {
          classNames:
            ANIMATION_MAP[history.action as 'PUSH' | 'POP' | 'REPLACE'],
        });
      }}
    >
      <CSSTransition
        key={location.pathname + '/'}
        // classNames={ANIMATION_MAP[history.action as ('PUSH' | 'POP')]}
        addEndListener={(node, done) => {
          node.addEventListener('transitionend', done, false);
        }}
      >
        <Switch location={location}>

          {/* eco */}
          <Route path={'/timer'} render={(props) => <Timer />} />
          {/* vacation */}
          <Route path={'/vacation'} render={(props) => <Vacation />} />
          {/* mute */}
          <Route exact path={'/mute'} render={(props) => <Mute />} />
          {/* eco */}
          <Route exact path={'/eco'} render={(props) => <ECO />} />
           {/* 定时时段 */}
           <Route exact path={'/interval'} render={(props) => <TimeInterval />} />
          {/* 主控 */}
          <Route exact path={'/'} render={(props) => <Main />} />
        </Switch>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App;
