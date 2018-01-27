// Dependencies
import React from "react";
import { render } from "react-dom";

import "./index.html";
import style from "../style/master.scss";
import favicon from "./favicon.ico";

// Internet Explorer ...
// Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (typeof Object.assign != "function") {
    Object.prototype.assign = function (target, varArgs) { // .length of function is 2
        "use strict";
        if (target == null) { // TypeError if undefined or null
            throw new TypeError("Cannot convert undefined or null to object");
        }

        const to = Object(target);

        for (let index = 1; index < arguments.length; index++) {
            const nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (const nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

import App from "../components/App.js";
import FrontPageController from "../components/FrontPageController";
import TodosController from "../components/TodosController";
import AdminController from "../components/AdminController";
import NotFoundController from "../components/NotFoundController";
import LiveChatController from "../components/LiveChatController";
import LoginController from "../components/LoginController";

// Router
import {
    Router,
    Route,
    IndexRedirect,
    browserHistory,
} from "react-router";

render((
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRedirect to="/blog"></IndexRedirect>
            <Route path="/blog" component={FrontPageController}></Route>
            <Route path="/blog/:articlename" component={FrontPageController}></Route>
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
), document.getElementById("app"));

// Reset scroll position
window.addEventListener("load", (event) => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
});

// Google Analytics
/* eslint-disable */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-89960492-1', 'auto');
ga('send', 'pageview');
/* eslint-enable */
