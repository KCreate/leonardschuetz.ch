// Dependencies
import React, { Component, PropTypes } from 'react';
import get from '../../utils/get';
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

        // Append to the data (Callback hell...)
        get('/resources/' + source + '/', 'GET', {}, (err, res) => {
            if (err) throw err;
            const directory = JSON.parse(res);

            // Load all articles
            directory.forEach((item, index) => {
                get('/resources/' + source + '/' + item.filename, 'GET', {}, (err, res) => {
                    if (err) throw err;
                    const files = JSON.parse(res);

                    // Check if all files exist
                    if (files.filter((item) => (
                        item.filename === 'article.md' ||
                        item.filename === 'meta.json'
                    )).length >= 2) {

                        // All files are found
                        get('/resources/' + source + '/' + item.filename + '/' + 'article.md',
                        'GET', {}, (err, articleResponse) => {
                            if (err) throw err;

                            get('/resources/' + source + '/' + item.filename + '/' + 'meta.json',
                            'GET', {}, (err, metaResponse) => {
                                if (err) throw err;
                                const content = JSON.parse(metaResponse);

                                // Replace some variables in the response
                                const article = articleResponse

                                // Global Path variable
                                .split('%%PATH%%')
                                .join('/resources/' + source + '/' + item.filename)

                                // Global File variable
                                .split('%%FILE%%')
                                .join(source + '/' + item.filename);

                                // Insert into the state tree
                                this.props.actions.addArticles(source, {
                                    meta: Object.assign({}, content, {
                                        path: '/resources/' + source + '/' + item.filename,
                                        file: source + '/' + item.filename,
                                    }),
                                    markdown: article,
                                }, index);
                            });
                        });
                    }
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
