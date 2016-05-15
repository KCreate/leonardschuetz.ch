// Dependencies
import React, { Component, PropTypes } from 'react';
import Markdown from 'react-remarkable';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './Card.scss';
class Card extends Component {
    render() {

    /*
    // Conditionally enable the share button
    const shareButton = this.state.shareButtonEnabled
    ? <div className="Card-Share"><Link to={'/article/' + this.props.meta.file}>Share</Link></div>
    : undefined;
    */

        return (
        <div className={'Card' + this.props.className}>
            <Markdown className="Card-Content" container="div" options={{ imagesAreBlocks: true }}>
                {this.props.children}
            </Markdown>
        </div>
        );
    }
}

export default Card;
