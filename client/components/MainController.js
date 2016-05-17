// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import get from '../../utils/get';
import Card from './Card';

// Router
import {
    Link,
    IndexLink,
} from 'react-router';

class MainController extends ProtoController {

    constructor(...args) {
        super(...args);

        this.state = Object.assign({}, this.state, {
            title: 'Leonard Schuetz',
            navigation: [
                ['blog', 'Blog'],
                ['projects', 'Projects'],
                ['about', 'About'],
                ['development', 'Development'],
            ],
            expanded: true,
        });
    }

    addCustomSources() {
        this.props.actions.addArticles('about', (
            <Card>
                # This is markdown mixed with some other react component

                <Card># What</Card>
            </Card>
        ), 10);
    }

    filterCards(cards, source) {
        if (source !== 'blog') return cards;
        return cards.reverse();
    }
}

export default MainController;
