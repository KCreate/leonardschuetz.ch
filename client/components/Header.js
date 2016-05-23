// Dependencies
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './../style/Header.scss';
class Header extends Component {

    constructor(...args) {
        super(...args);
        this.paralaxHandler = this.paralaxHandler.bind(this);

        this.state = {
            progress: 0,
        };
    }

    componentDidMount() {

        // Paralax handling
        if (window) {
            window.addEventListener('scroll', this.paralaxHandler);
        }

        // Write animation
        setTimeout(() => {
            const interval = setInterval(() => {

                this.setState({
                    progress: this.state.progress + 1,
                });

                // If we reached the last char, notify the parent
                if (this.state.progress > this.props.title.length) {
                    clearInterval(interval);
                    this.props.writingAnimationFinished({});
                }
            }, 60);
        }, 100);
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.progress > this.props.title.length) {
            this.setState({
                progress: nextProps.title.length + 1,
            });
        }
    }

    componentWillUnmount() {
        if (window) {
            window.removeEventListener('scroll', this.paralaxHandler);
        }
    }

    paralaxHandler(event) {

        let x, y;

        // Reference: https://developer.mozilla.org/de/docs/Web/API/Window/scrollY
        const supportPageOffset = (window.pageXOffset !== undefined && window.pageYOffset !== undefined);
        const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
        if (supportPageOffset) {
            x = window.pageXOffset;
            y = window.pageYOffset;
        } else {
            if (isCSS1Compat) {
                x = document.documentElement.scrollLeft;
                y = document.documentElement.scrollTop;
            } else {
                x = document.body.scrollLeft;
                y = document.body.scrollTop;
            }
        }

        // Paralax modifier
        const modifier = 0.25;
        const xModified = x * modifier;
        const yModified = y * modifier;

        // Only translate if the Header is physically on the screen
        if (y <= 205 * (1 + modifier)) {
            if (this.refs.Header) {
                this.refs.Header.style.transform = 'translateY(' + yModified + 'px)';
            }
        }
    }

    render() {

        const navigationItems = this.props.navigation
        .map((item, index) => (
            <li key={index}>
                <Link to={'/' + item[0]} activeClassName="current">{item[1]}</Link>
            </li>
        ));

        return (
            <div className={classnames({ Header: true, expanded: this.props.expanded })} ref="Header">
                <div>
                    <h1><Link to="/">{this.props.title.slice(0, this.state.progress)}</Link></h1>
                    <ul>
                        {navigationItems}
                    </ul>
                </div>
            </div>
        );
    }
}

export default Header;
