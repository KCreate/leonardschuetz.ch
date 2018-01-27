// Dependencies
import React, { Component } from "react";
import Markdown from "react-remarkable";
import highlight from "highlight.js";
import "../style/highlightjs/tomorrow-night-blue.css";

const cachedMarkdown = { sources: [], highlighted: [] };
const MarkdownConfigHighlight = {
    imagesAreBlocks: true,
    highlight: (str, lang) => {

        // Don't highlight the "" lang
        // This happens when a code block is defined as
        // ```
        // // code
        // ```
        if (lang === "") {
            return str;
        }

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
        const highlighted = highlight.highlight(lang, str, true).value;
        cachedMarkdown.sources.push(str);
        cachedMarkdown.highlighted.push(highlighted);

        return highlighted;
    },
};
const MarkdownConfigNoHighlight = {
    imagesAreBlocks: true,
};

import "./../style/Card.scss";
class Card extends Component {

    constructor(...args) {
        super(...args);
        this.getMarkdown = this.getMarkdown.bind(this);
        this.preProcessMarkdown = this.preProcessMarkdown.bind(this);
        this.state = {
            shouldHighlight: false,
        };
    }

    preProcessMarkdown(markdown, source, filename) {
        return (
            markdown
            .split("%%PATH%%")
            .join("/resources/" + source + "/" + filename)
            .split("%%FILE%%")
            .join(source + "/" + filename)
        );
    }

    getMarkdown() {

        let processedMarkdown = this.props.children;
        if (this.props.meta) {
            processedMarkdown = this.preProcessMarkdown(
                processedMarkdown,
                this.props.meta.category,
                this.props.meta.filename
            );
        }

        if (this.state.shouldHighlight) {
            return (
                <Markdown className="Card-Content" container="div" options={MarkdownConfigHighlight}>
                    {processedMarkdown}
                </Markdown>
            );
        } else {
            return (
                <Markdown className="Card-Content" container="div" options={MarkdownConfigNoHighlight}>
                    {processedMarkdown}
                </Markdown>
            );
        }
    }

    componentDidMount() {
        this.interval = setTimeout(() => {
            this.setState({
                shouldHighlight: true,
            });
        }, 2000);
    };

    componentWillUnmount() {
        clearTimeout(this.interval);
    }

    render() {
        let article_address

        if (this.props.meta) {
            article_address = "/blog/" + this.props.meta.filename
        }

        return (
            <div className={"Card" + (this.props.className || "")}>
                {this.getMarkdown()}
                {article_address ? <a href={article_address}>Share article</a> : undefined}
            </div>
        );
    }
}

export default Card;
