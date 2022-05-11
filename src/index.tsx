import 'react-app-polyfill/stable';//必须放在第一行
import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router
} from "react-router-dom";
import './index.css';
import RootProvider from '@root/index';
import App from '@panel/App';
// import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <RootProvider >
      <Router>
        <App />
      </Router>
    </RootProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
