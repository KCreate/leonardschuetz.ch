// Dependencies
import React from 'react';
import { render } from 'react-dom';

import './index.html';
import style from '../style/master.scss';
import favicon from './favicon.ico';

import App from '../components/App.js';
import FrontPageController from '../components/FrontPageController';
import TodosController from '../components/TodosController';
import AdminController from '../components/AdminController';
import NotFoundController from '../components/NotFoundController';
import LiveChatController from '../components/LiveChatController';
import LoginController from '../components/LoginController';

// Router
import {
    Router,
    Route,
    IndexRedirect,
    browserHistory,
} from 'react-router';

render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRedirect to="/blog"></IndexRedirect>
            <Route path="/blog" component={FrontPageController}></Route>
            <Route path="/about" component={FrontPageController}></Route>
            <Route path="/todos" component={TodosController}></Route>
            <Route path="/admin" component={AdminController}></Route>
            <Route path="/pngencoder" component={AdminController}></Route>
            <Route path="/markdown" component={AdminController}></Route>
            <Route path="/livechat" component={LiveChatController}></Route>
            <Route path="/auth" component={LoginController}></Route>
            <Route path="/*" component={NotFoundController}></Route>
        </Route>
    </Router>
), document.getElementById('app'));

// Reset scroll position
window.addEventListener('load', (event) => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
});

/*
 * Google Analytics
 * */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-89960492-1', 'auto');
ga('send', 'pageview');
