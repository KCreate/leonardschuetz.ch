// Dependencies
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './Header.scss';
class Header extends Component {

    constructor(...args) {
        super(...args);
        this.paralaxHandler = this.paralaxHandler.bind(this);

        this.state = Object.assign({}, this.props, {
            title: '',
            titleToWrite: this.props.title,
        });
    }

    componentDidMount() {

        if (window) {
            window.addEventListener('scroll', this.paralaxHandler);
        }

        let i = 0;
        setTimeout(() => {
            const interval = setInterval(() => {

                // Change the title
                this.setState({
                    title: this.state.titleToWrite.substr(0, i),
                });

                // Increment the counter
                i++;

                // If we reached the last char, notify the parent
                if (i > this.state.titleToWrite.length) {
                    clearInterval(interval);
                    this.props.writingAnimationFinished({});
                }
            }, 60);
        }, 100);
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

        function shouldInclude(value) {
            return (value !== undefined && value !== false) || value === undefined;
        }

        return (
            <div className={classnames({ Header: true, expanded: this.props.expanded })} ref="Header">
                <div>
                    <h1><Link to="/">{this.state.title}</Link></h1>
                    <ul>
                        {this.props.navigation.filter(shouldInclude).map((item, index) => (
                            <li key={index}>
                                <Link to={'/' + item[0]} activeClassName="current">{item[1]}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default Header;
