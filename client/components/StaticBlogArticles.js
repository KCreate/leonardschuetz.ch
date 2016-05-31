// Dependencies
import React, { Component } from 'react';
import DeferedContainerList from 'deferedcontainerlist';
import Card from './Card.js';
import {
    categoryList,
    getFile,
} from '../../utils/getArticle';

class StaticBlogArticles extends Component {

    constructor(...args) {
        super(...args);

        this.state = {
            sources: {},
        };
    }

    componentDidMount() {
        this.props.navigation.forEach((item, index) => {

            const source = item[0];

            // Request a list of all articles inside the category
            categoryList(source, (res) => {
                if (!res) return console.error.call(console, 'error loading articles for category: ' + source);

                res.forEach((article, index) => {

                    // Request the article.md and meta.json file
                    getFile(source, article.filename, 'article.md', (markdown) => {
                        if (!markdown) return;
                        getFile(source, article.filename, 'meta.json', (meta) => {
                            if (!meta) return;

                            meta = JSON.parse(meta);

                            const newSources = (this.state.sources[source] || []).slice(0);
                            newSources[index] = {
                                meta: Object.assign({}, meta, {
                                    filename: article.filename,
                                    category: source,
                                }),
                                markdown,
                            };

                            this.setState({
                                sources: Object.assign({}, this.state.sources, {
                                    [source]: newSources,
                                }),
                            });
                        });
                    });
                });
            });
        });
    }

    render() {

        // If the right sources don't exist yet
        if (!this.state.sources[this.props.active]) {
            return (
                <div>
                    <Card># Loading...</Card>
                </div>
            );
        }

        // Get the list of cards
        let cards = this.state.sources[this.props.active]
        .map((item, index) => (
            <Card key={index} meta={item.meta}>
                {item.markdown}
            </Card>
        ));

        // Reverse the order of the cards if the source is blog
        if (this.props.active === 'blog') {
            cards = cards.reverse();
        }

        return (
            <DeferedContainerList
                delay={400}
                appliedClassName="deferedApplied"
            >{cards}</DeferedContainerList>
        );
    }
}

export default StaticBlogArticles;
