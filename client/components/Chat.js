// Dependencies
import React, { Component, PropTypes } from 'react';
import LimitedInput from './LimitedInput';
import Card from './Card';
import MessagesView from './MessagesView';

class Chat extends Component {

    constructor(...args) {
        super(...args);

        this.newMessageHandler = this.newMessageHandler.bind(this);
        this.valueChange = this.valueChange.bind(this);

        this.state = {
            value: '',
        };
    }

    newMessageHandler(event) {
        event.preventDefault();
        this.props.newMessageHandler(this.state.value.trim());
        this.setState({
            value: '',
        });
    }

    valueChange(value) {
        this.setState({
            value,
        });
    }

    render() {
        return (
            <Card>
                # Chat
                <MessagesView
                    messages={this.props.messages}
                    livechat={this.props.livechat}>
                </MessagesView>
                <form onSubmit={this.newMessageHandler}>
                    <LimitedInput
                        placeholder="Message"
                        maxlength={this.props.messageMaxLength}
                        value={this.state.value}
                        onChange={this.valueChange}></LimitedInput>
                    <button type="submit">Send</button>
                </form>
            </Card>
        );
    }
}

Chat.propTypes = {
    messages: PropTypes.array.isRequired,
    livechat: PropTypes.object.isRequired,
    newMessageHandler: PropTypes.func.isRequired,
    messageMaxLength: PropTypes.number.isRequired,
};

export default Chat;
