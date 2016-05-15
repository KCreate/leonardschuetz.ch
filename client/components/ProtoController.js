// Dependencies
import React, { Component, PropTypes } from 'react';
import get from '../../utils/get';
import Card from './Card';

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
        this.getCurrentCards = this.getCurrentCards.bind(this);
        this.renderCurrentCards = this.renderCurrentCards.bind(this);
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

    getCurrentCards() {

        // Global cards available to every controller
        const cards = ({})[this.props.route.path];

        // If no cards were found
        if (!cards && typeof cards === 'undefined') {

            // Markdown
            return (
                <Card># Resource not found</Card>
            );
        }

        return cards;
    }

    renderCurrentCards(source) {

        // Return an empty array if no cards were found
        if (!this.props.sources[source]) {
            return [];
        }

        const cards = this.props.sources[source].map((child, index) => (
            <Card
                key={index}
                meta={child.meta}>
                {child.markdown}
            </Card>
        ));

        // Return all the cards from the store
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
                                    index,
                                });
                            });
                        });
                    }
                });
            });
        });
    }

    render() {
        return (
            <div className="ProtoController">
                <h1>Hi! I'm a ProtoController!</h1>
            </div>
        );
    }
}

export default ProtoController;
