// Dependencies
import React, { Component, PropTypes } from 'react';

import './../style/List.scss';
class List extends Component {
    render() {
        return (
            <ul className="List">
                {this.props.children.map((text, index) => (
                    <li key={index} className="ListItem">{text}</li>
                ))}
            </ul>
        );
    }
}

export default List;
