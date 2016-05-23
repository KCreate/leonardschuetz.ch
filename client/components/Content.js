// Dependencies
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './../style/Content.scss';
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
