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
            <Route path="/livechat" component={LiveChatController}></Route>
            <Route path="/auth" component={LoginController}></Route>
            <Route path="/*" component={NotFoundController}></Route>
        </Route>
    </Router>
), document.getElementById('app'));

// Remove all noscript element from the page
Array.from(document.querySelectorAll('noscript')).forEach((element) => {
    element.parentElement.removeChild(element);
});
