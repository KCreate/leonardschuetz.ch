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
        this.initialDataLoadForSource = this.initialDataLoadForSource.bind(this);
        this.writingAnimationFinished = this.writingAnimationFinished.bind(this);
        this.renderCurrentCards = this.renderCurrentCards.bind(this);
        this.addCustomSources = this.addCustomSources.bind(this);
        this.filterCards = this.filterCards.bind(this);

        this.state = {
            title: 'ProtoController',
            navigation: [
                ['index', 'Index'],
            ],
            expanded: true,
            sources: Object.assign({}, this.props.sources),
        };

        this.addCustomSources();
    }

    componentDidMount() {
        if (this.state) {
            if (this.state.navigation.length) {
                this.state.navigation.forEach((item, index) => {
                    this.initialDataLoadForSource(item[0]);
                });
            }
        }
    }

    addCustomSources() {
        return;
    }

    renderCurrentCards() {
        const source = this.props.route.path.slice(1);
        if (!this.props.sources[source]) {
            return [
                <Card key={0}># Resource not found!</Card>,
            ];
        }

        const cards = this.props.sources[source].map((child, index) => {

            // If we've got passed a Component directly, just use that instead.
            if (child['$$typeof']) {
                return React.cloneElement(child, {
                    key: index,
                });
            }

            // Else just create a new Card object
            return (
                <Card
                    key={index}
                    meta={child.meta}>
                    {child.markdown}
                </Card>
            );
        });

        // Return all the cards from the store
        return this.filterCards(cards, source);
    }

    filterCards(cards, source) {
        return cards;
    }

    writingAnimationFinished(event) {
        this.setState({
            expanded: false,
        });
    }

    initialDataLoadForSource(source) {
        this.state.navigation.forEach((item) => {
            categoryList(item[0], (res) => {
                res.forEach((article, index) => {
                    getFile(item[0], article.filename, 'article.md', (markdown) => {
                        getFile(item[0], article.filename, 'meta.json', (meta) => {
                            meta = JSON.parse(meta);

                            // Replace keywords in the markdown
                            const parsedMarkdown = markdown
                            .split('%%PATH%%')
                            .join('/resources/' + item[0] + '/' + article.filename)
                            .split('%%FILE%%')
                            .join(item[0] + '/' + article.filename);

                            // Add to the redux sources
                            this.props.actions.addArticles(item[0], {
                                meta: Object.assign({}, meta, {
                                    path: '/resources/' + item[0] + '/' + article.filename,
                                    file: item[0] + '/' + article.filename,
                                }),
                                markdown: parsedMarkdown,
                            }, index);
                        });
                    });
                });
            });
        });
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
