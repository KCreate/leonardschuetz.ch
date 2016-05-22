// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Card from './Card';
import TodoList from './TodoList';
import get from '../../utils/get';

class TodosController extends ProtoController {

    constructor(...args) {
        super(...args);

        this.handleDelete = this.handleDelete.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.listTodos = this.listTodos.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);

        this.state = Object.assign({}, this.state, {
            title: 'Todos',
            navigation: [
                ['todos', 'Todos'],
            ],
            todos: [],
            password: '',
            authorized: false,
        });
    }

    listTodos() {
        get('/todosapi', 'POST', {
            payload: {
                password: this.state.password,
            },
        }, (err, res) => {
            this.setState({
                todos: JSON.parse(res).todos,
                authorized: !JSON.parse(res).reason,
            });
        });
    }

    handleDelete(index) {
        get('/todosapi/' + index, 'DELETE', {
            payload: {
                password: this.state.password,
            },
        }, (err, res) => {
            this.listTodos();
        });
    }

    handleUpload(event) {

        event.preventDefault();

        get('/todosapi', 'PUT', {
            payload: {
                password: this.state.password,
                text: this.refs.todoInput.value,
            },
        }, (err, res) => {
            this.refs.todoInput.value = '';
            this.listTodos();
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
        }, () => {
            this.listTodos();
        });
    }

    content(navItems, routerParams, routerPath) {

        let todoInput;
        let todoList;
        let passwordInput;
        if (this.state.authorized) {
            todoInput = (
                <Card>
                    # Add todo
                    <form onSubmit={this.handleUpload}>
                        <input placeholder="Do something..." ref="todoInput"></input>
                        <input type="submit" value="Add Todo"></input>
                    </form>
                </Card>
            );
            todoList = (
                <Card>
                    # Todos
                    <span>
                        <TodoList
                            todos={this.state.todos}
                            oncomplete={this.handleDelete}
                        ></TodoList>
                    </span>
                </Card>
            );
        } else {
            passwordInput = (
                <Card>
                    # Enter password
                    <input
                        type="password"
                        onChange={this.handlePasswordChange}
                        value={this.state.password}
                        placeholder="Password">
                    </input>
                </Card>
            );
        }

        return (
            <div>
                {passwordInput}
                {todoInput}
                {todoList}
            </div>
        );
    }
}

export default TodosController;
