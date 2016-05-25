// Dependencies
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import dateFormat from 'dateformat';

import './../style/MessagesView.scss';
class MessagesView extends Component {

    constructor(...args) {
        super(...args);

        this.messagesReducer = this.messagesReducer.bind(this);
        this.messagesFormat = this.messagesFormat.bind(this);
    }

    messagesReducer(last, current, index) {

        const lastIndex = last.length - 1;
        let lastMessage = last[lastIndex];

        // If the last was empty, just return the current
        if (lastIndex === -1) {
            return [current];
        }

        // If the last message is of the same user, group it together
        if (lastMessage.username === current.username) {
            lastMessage = Object.assign({}, lastMessage);
            lastMessage.time = current.time;
            lastMessage.messages.push(current.messages[0]);

            last[lastIndex] = lastMessage;
            return last;
        } else {
            return last.concat(current);
        }
    }

    messagesFormat(message, index) {
        return {
            username: message.user.username,
            messages: [message.message],
            time: message.time,
        };
    }

    render() {

        const messages = this.props.messages
        .map(this.messagesFormat)
        .reduce(this.messagesReducer, [])
        .map((message, index) => {
            const classNames = classnames({
                MessageItem: true,
                currentUser: (message.username === this.props.livechat.username),
                otherUser: (message.username !== this.props.livechat.username),
            });

            const formatedTime = dateFormat(
                Number(message.time),
                'dd.mm - HH:MM:ss'
            );

            return (
                <div key={index} className={classNames}>
                    <span className="title">{message.username}</span>
                    <span className="messages">
                        {message.messages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </span>
                    <span className="time">{formatedTime}</span>
                </div>
            );
        });

        return (
            <div className="MessagesView">
                {messages}
            </div>
        );
    }
}

MessagesView.defaultProps = {
    messages: [],
    livechat: {},
};

export default MessagesView;
