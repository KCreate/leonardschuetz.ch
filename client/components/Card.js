// Dependencies
import React, { Component, PropTypes } from 'react';
import Markdown from 'react-remarkable';
import highlight from 'highlight.js';
import 'highlight.js/styles/material.css';

const cachedMarkdown = { sources: [], highlighted: [] };
const MarkdownConfigHighlight = {
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
const MarkdownConfigNoHighlight = {
    imagesAreBlocks: true,
};

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

import './Card.scss';
class Card extends Component {

    constructor(...args) {
        super(...args);
        this.getMarkdown = this.getMarkdown.bind(this);
        this.state = {
            shouldHighlight: false,
        };
    }

    getMarkdown() {
        if (this.state.shouldHighlight) {
            return (
                <Markdown className="Card-Content" container="div" options={MarkdownConfigHighlight}>
                    {this.props.children}
                </Markdown>
            );
        } else {
            return (
                <Markdown className="Card-Content" container="div" options={MarkdownConfigNoHighlight}>
                    {this.props.children}
                </Markdown>
            );
        }
    }

    componentDidMount() {
        const interval = setTimeout(() => {
            this.setState({
                shouldHighlight: true,
            });
        }, 2000);
    };

    render() {
        return (
        <div className={'Card' + this.props.className}>
            {this.getMarkdown()}
        </div>
        );
    }
}

export default Card;
