// Dependencies
import React, { Component } from "react";
import classnames from "classnames";

import "./../style/Content.scss";
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
