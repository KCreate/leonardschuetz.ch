// Dependencies
import React, { Component, PropTypes } from 'react';
import Card from './Card';

import './../style/TodoList.scss';
import './../style/List.scss';
class TodoList extends Component {
    render() {
        return (
            <ul className="List">
                {this.props.todos.map((todo, index) => (
                    <li key={index} className="ListItem">
                        {todo.text}<button onClick={() => {
                            this.props.oncomplete(index);
                        }}>Remove</button>
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
