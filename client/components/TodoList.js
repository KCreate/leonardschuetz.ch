// Dependencies
import React, { Component } from "react";
import Card from "./Card";

import "./../style/TodoList.scss";
import "./../style/List.scss";
class TodoList extends Component {

    constructor(...args) {
        super(...args);
        this.onRemove = this.onRemove.bind(this);
    }

    onRemove(index) {
        this.props.oncomplete(index);
    }

    render() {
        return (
            <ul className="List">
                {this.props.todos.map((todo, index) => (
                    <li key={index} className="ListItem">
                        {(todo.isLink ? <a href={todo.text}>{todo.text}</a> : todo.text)}
                        <button onClick={this.onRemove.bind(this, index)}>Remove</button>
                    </li>
                ))}
            </ul>
        );
    }
}

TodoList.defaultProps = {
    todos: [],
    oncomplete: () => {},
};

export default TodoList;
