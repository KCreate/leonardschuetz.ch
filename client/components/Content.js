// Dependencies
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import DeferedContainerList from 'deferedcontainerlist';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './scss/Content.scss';
class Content extends Component {
    render() {
        return (
            <div className={classnames({ Content: true, expanded: this.props.expanded })}>
                {this.props.children}
            </div>
        );
    }
}

export default Content;
