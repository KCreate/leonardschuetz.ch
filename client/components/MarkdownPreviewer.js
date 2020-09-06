// Dependencies
import React, { Component } from "react";
import Card from "./Card";
import get from "../../utils/get";

class MarkdownPreviewer extends Component {

    constructor(...args) {
        super(...args);
        this.onchange = this.onchange.bind(this);
        this.debounce = undefined;
        this.reload_timer = undefined;

        this.state = {
            source: "",
            markdown: "",
        };
    }

    componentDidMount() {
        this.reload_timer = setInterval(() => {
            this.onchange()
        }, 2000);
    }

    componentWillUnmount() {
      clearInterval(this.reload_timer);
    }

    onchange(event) {

        if (!event) {
            event = {
                target: {
                    value: this.state.source,
                },
            };
        }

        this.setState({
            source: event.target.value,
        }, () => {

            // Debounce api calls
            if (this.debounce) {
                clearTimeout(this.debounce);
                this.debounce = undefined;
            }

            this.debounce = setTimeout(() => {
                get(this.state.source, "GET", { noCache: true }, (err, response) => {
                    if (err) return;

                    this.setState({
                        markdown: response,
                    });
                });
            }, 300);
        });
    }

    render() {
        return (
            <div>
                <Card>
                    # Markdown Previewer
                    <input
                        placeholder="Source URL"
                        value={this.state.source}
                        onChange={this.onchange}
                        onKeyDown={(event) => {
                            if (event.keyCode === 13) {
                                this.onchange(event);
                            }
                        }}>
                    </input>
                    <button onClick={this.onchange.bind(null, null)}>Update</button>
                </Card>
                <Card>
                    {this.state.markdown}
                </Card>
            </div>
        );
    }
}

export default MarkdownPreviewer;
