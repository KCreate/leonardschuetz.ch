// Dependencies
import React, { Component, PropTypes } from 'react';
import Card from './Card';

import './scss/TodoList.scss';
class TodoList extends Component {
    render() {
        return (
            <ul className="TodoList">
                {this.props.todos.map((todo, index) => (
                    <li key={index} className="TodoItem">
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
