// Dependencies
import React, { Component, PropTypes } from 'react';
import get from '../../utils/get';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

class ProtoController extends Component {

    constructor(...args) {
        super(...args);
        this.initialDataLoadForSource = this.initialDataLoadForSource.bind(this);
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
