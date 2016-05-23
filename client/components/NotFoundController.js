// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Card from './Card';

class NotFoundController extends ProtoController {

    constructor(...args) {
        super(...args);
        this.state = Object.assign({}, this.state, {
            title: '404',
            navigation: [
                ['blog', 'Bring me back!'],
            ],
        });
    }

    content(navItems, routerParams, routerPath) {
        return (
            <div>
                <Card>
                    <h1>Ooops...</h1>
                    <p>
                        This is not the web page you are looking for.
                    </p>
                    <img src="/resources/documents/weaintfoundshit.jpg" />
                </Card>
            </div>
        );
    }
}

export default NotFoundController;
