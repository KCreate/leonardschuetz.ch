// Dependencies
import React, { Component, PropTypes } from 'react';
import { categoryList, getFile } from '../../utils/getArticle';
import Card from './Card';
import Content from './Content';
import Header from './Header';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

class ProtoController extends Component {

    constructor(...args) {
        super(...args);
        this.writingAnimationFinished = this.writingAnimationFinished.bind(this);
        this.renderCurrentCards = this.renderCurrentCards.bind(this);
        this.filterCards = this.filterCards.bind(this);
        this.loadSources = this.loadSources.bind(this);
        this.requestSource = this.requestSource.bind(this);
        this.configController = this.configController.bind(this);

        this.state = {
            title: 'Leonard Schuetz',
            navigation: [
                ['index', 'Index', { noNetworkRequest: true }],
            ],
            expanded: true,
            sources: Object.assign({}, this.props.sources),
            requestSent: false,
        };
    }

    componentDidMount() {
        this.loadSources();
    }

    configController(config) {
        this.setState(Object.assign({}, config, {
            requestSent: false,
        }), () => {
            this.loadSources();
        });
    }

    filterCards(cards, source) {
        return cards;
    }

    writingAnimationFinished(event) {
        this.setState({
            expanded: false,
        });
    }

    preprocessMarkdown(markdown, source, article) {
        return (
            markdown
            .split('%%PATH%%')
            .join('/resources/' + source + '/' + article.filename)
            .split('%%FILE%%')
            .join(source + '/' + article.filename)
        );
    }

    requestSource(navItem, callback) {
        callback([], navItem[0]);
    }

    loadSources() {

        // Check if the request has been sent before
        if (!this.state.requestSent) {

            // Update the state
            this.setState({
                requestSent: true,
            });

            // Iterate over all registered sources
            this.state.navigation.forEach((item, index) => {

                const source = item[0];

                // Check if the source requires a network request
                if (!(item[2] || {}).noNetworkRequest) {

                    // Request a list of all articles inside the category
                    categoryList(item[0], (res) => {
                        if (!res) return console.error.call(console, 'error loading categories');

                        res.forEach((article, index) => {

                            // Request the article.md and meta.json file
                            getFile(source, article.filename, 'article.md', (markdown) => {
                                if (!markdown) return;
                                getFile(source, article.filename, 'meta.json', (meta) => {
                                    if (!meta) return;

                                    meta = JSON.parse(meta);

                                    // Add to the redux sources
                                    this.props.actions.addArticles(source, {
                                        meta: Object.assign({}, meta, {
                                            path: '/resources/' + source + '/' + article.filename,
                                            file: source + '/' + article.filename,
                                        }),
                                        markdown: this.preprocessMarkdown(markdown, source, article),
                                    }, index);
                                });
                            });
                        });
                    });
                } else {

                    // If the source does not require a network request, ask the controller
                    this.requestSource(item, (items, source) => {
                        if (items.length) {

                            // Add all items to the store
                            items.forEach((item, index) => {
                                this.props.actions.addArticles(source, {
                                    meta: Object.assign({}, meta, {
                                        path: '/resources/' + source + '/' + item.filename,
                                        file: source + '/' + item.filename,
                                    }),
                                    markdown: this.preprocessMarkdown(item.markdown),
                                }, index);
                            });
                        }
                    });
                }
            });
        }
    }

    renderCurrentCards() {
        const source = this.props.route.path.slice(1);

        // If no source is found
        if (!this.props.sources[source]) {
            return [
                <Card key={0}># Resource not found!</Card>,
            ];
        }

        const cards = this.props.sources[source]
        .map((child, index) => (
            <Card
                key={index}
                meta={child.meta}>
                {child.markdown}
            </Card>
        ));

        // Return all the cards from the store
        return this.filterCards(cards, source);
    }

    render() {

        const expandedStyle = 'body{height:100vh;overflow:hidden}';

        return (
            <div className="Controller">
                <Header
                    title={this.state.title}
                    navigation={this.state.navigation}
                    expanded={this.state.expanded}
                    writingAnimationFinished={this.writingAnimationFinished}></Header>

                {(this.state.expanded ? (
                    <style>{expandedStyle}</style>
                ) : undefined)}

                <Content
                    expanded={this.state.expanded}>
                    {this.renderCurrentCards()}
                </Content>
            </div>
        );
    }
}

export default ProtoController;
