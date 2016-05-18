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
            ],
            expanded: true,
        });
    }

    filterCards(cards, source) {
        if (source !== 'blog') return cards;
        return cards.reverse();
    }

    sourceNotFound(source, route, params) {

        // Check if we are in the article url
        if (source.split('/')[0] === 'article') {
            if (this.props.sources[params.category]) {
                return this.props.sources[params.category].filter((item) => (
                    item.meta.file === params.category + '/' + params.name
                ));
            }
        }

        return false;
    }
}

export default MainController;
