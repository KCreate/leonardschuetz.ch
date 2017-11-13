// Dependencies
import React, { Component } from "react";
import classnames from "classnames";
import dateFormat from "dateformat";

import "./../style/MessagesView.scss";
class MessagesView extends Component {

    constructor(...args) {
        super(...args);

        this.messagesReducer = this.messagesReducer.bind(this);
        this.messagesFormat = this.messagesFormat.bind(this);
        this.displayMessage = this.displayMessage.bind(this);
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
        if (message.file) {
            return {
                username: message.user.username,
                messages: [message.file],
                time: message.time,
            };
        } else {
            return {
                username: message.user.username,
                messages: [message.message],
                time: message.time,
            };
        }
    }

    displayMessage(item, index) {
        if (typeof item !== "string") {

            // Format the filename
            let filename = item.file.name;
            const maxlength = 40;
            if (filename.length > maxlength) {
                filename = filename.slice(0, maxlength) + "...";
            }

            switch (item.file.type) {
            case ("image/jpeg"):
            case ("image/png"):
            case ("image/gif"): {
                return (
                    <div key={index} className="embeded image">
                        <div>
                            <img src={item.apiResponse.link}/>
                        </div>
                        <div className="meta">
                            <p className="filename">{filename}</p>
                            <p className="size">Size: {item.file.size} bytes</p>
                            <a href={item.apiResponse.link} download={item.file.name}>
                                <button>Download</button>
                            </a>
                            <a href={item.apiResponse.link} target="_blank">
                                <button>Open</button>
                            </a>
                        </div>
                    </div>
                );
            }
            default: {
                return (
                    <div key={index} className="embeded document">
                        <div>
                            <img src="/resources/livechat/document.png"/>
                        </div>
                        <div className="meta">
                            <p className="filename">{filename}</p>
                            <p className="size">Size: {item.file.size} bytes</p>
                            <a href={item.apiResponse.link} download={item.file.name}>
                                <button>Download</button>
                            </a>
                            <a href={item.apiResponse.link} target="_blank">
                                <button>Open</button>
                            </a>
                        </div>
                    </div>
                );
            }
            }
        } else {
            return (
                <p key={index}>{item}</p>
            );
        }
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
                "dd.mm - HH:MM:ss"
            );

            return (
                <div key={index} className={classNames}>
                    <span className="title">{message.username}</span>
                    <span className="messages">
                        {message.messages.map(this.displayMessage)}
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
