// Dependencies
import React, { Component } from "react";
import ProtoController from "./ProtoController";
import StaticBlogArticles from "./StaticBlogArticles";

class FrontPageController extends ProtoController {

    constructor(...args) {
        super(...args);

        this.state = Object.assign({}, this.state, {
            navigation: [
                ["blog", "Blog"],
                ["about", "About"],
            ],
        });
    }

    content(navItems, routerParams, routerPath) {
        return (
            <StaticBlogArticles
                navigation={this.state.navigation}
                active={routerPath.path.slice(1)}
                actions={this.props.actions}
                articlename={this.props.params.articlename}
            ></StaticBlogArticles>
        );
    }
}

export default FrontPageController;
