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

        this.state = Object.assign({}, this.props, {
            title: '',
            titleToWrite: this.props.title,
        });
    }

    componentDidMount() {

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
                if (i === this.state.titleToWrite.length) {
                    this.props.writingAnimationFinished({});
                }
            }, 60);
        }, 100);
    }

    render() {
        return (
            <div className={classnames({ Header: true, expanded: this.props.expanded })}>
                <div>
                    <h1>{this.state.title}</h1>
                    <ul>
                        {this.props.navigation.map((item, index) => (
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
