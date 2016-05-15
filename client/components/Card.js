// Dependencies
import React, { Component, PropTypes } from 'react';
import Markdown from 'react-remarkable';
import highlight from 'highlight.js';
import 'highlight.js/styles/material.css';

const cachedMarkdown = { sources: [], highlighted: [] };
const MarkdownConfig = {
    imagesAreBlocks: true,
    highlight: (str, lang) => {

        // Check if this string has already been highlighted once
        const cached = cachedMarkdown.sources.map((item, index) => ({
            string: item,
            index,
        })).filter((item) => item.string === str);

        // Return the cached highlight
        if (cached.length) {
            return cachedMarkdown.highlighted[cached[0].index];
        }

        // Highlight if not found
        const highlighted = highlight.highlightAuto(str).value;
        cachedMarkdown.sources.push(str);
        cachedMarkdown.highlighted.push(highlighted);

        return highlighted;
    },
};

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './Card.scss';
class Card extends Component {
    render() {
        return (
        <div className={'Card' + this.props.className}>
            <Markdown className="Card-Content" container="div" options={MarkdownConfig}>
                {this.props.children}
            </Markdown>
        </div>
        );
    }
}

export default Card;
