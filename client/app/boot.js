// Dependencies
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from '../redux/store';

const store = configureStore();

//import style from '../style/master.scss';
import favicon from './favicon.png';
import App from '../components/App.js';
import MainController from '../components/MainController';

// Router
import {
    Router,
    Route,
    Redirect,
    IndexRedirect,
    browserHistory,
    IndexRoute,
} from 'react-router';

render((
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRedirect to="/blog"></IndexRedirect>
                <Route path="/blog" component={MainController}></Route>
                <Route path="/about" component={MainController}></Route>
                <Route path="/article/:category/:name" component={MainController}></Route>
                <Redirect from="/*" to="/blog"></Redirect>
            </Route>
        </Router>
    </Provider>
), document.getElementById('app'));
