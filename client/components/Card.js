// Dependencies
import React, { Component, PropTypes } from 'react';
import marked from 'marked';
import highlightJS from 'highlight.js';
import highlightJSStyle from 'highlight.js/styles/material.css';

// Configure marked
marked.setOptions({
    highlight(code) {
        return highlightJS.highlightAuto(code).value;
    },
});

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './Card.scss';
class Card extends Component {
    render() {

        const html = {
            __html: marked(this.props.children),
        };

        return (
            <div className={'Card' + this.props.className}>
                <div className="Card-Content" dangerouslySetInnerHTML={html}></div>
                <div className="Card-Share"><Link to={'/article/' + this.props.meta.file}>Share</Link></div>
                <div className="Card-Share"><Link to={'/article/' + this.props.meta.file}>Share</Link></div>
            </div>
        );
    }
}

export default Card;
