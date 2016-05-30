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

        this.state = Object.assign({}, this.state, {
            title: 'Todos',
            navigation: [
                ['todos', 'Todos'],
            ],
            todos: [],
            password: '',
            needsAuthentication: true,
        });
    }

    listTodos() {
        get('/todosapi', 'POST', {}, (err, res) => {
            this.setState({
                todos: JSON.parse(res).todos,
                authorized: !JSON.parse(res).reason,
            });
        });
    }

    handleDelete(index) {
        get('/todosapi/' + index, 'DELETE', {}, (err, res) => {
            this.listTodos();
        });
    }

    handleUpload(event) {

        event.preventDefault();

        get('/todosapi', 'PUT', {
            payload: {
                text: this.refs.todoInput.value,
                isLink: this.refs.todoInputIsLink.checked,
            },
        }, (err, res) => {
            this.refs.todoInput.value = '';
            this.listTodos();
        });
    }

    componentDidMount() {
        if (this.state.authenticated) {
            this.listTodos();
        }
    }

    authenticated() {
        this.listTodos();
    }

    content(navItems, routerParams, routerPath) {
        const todoInput = (
            <Card>
                # Add todo
                <form onSubmit={this.handleUpload}>
                    <input placeholder="Todo" ref="todoInput"></input>
                    <input type="checkbox" ref="todoInputIsLink" name="todoInputIsLink"></input>
                    <label for="todoInputIsLink">Todo is a link</label>
                    <button type="submit">Add Todo</button>
                </form>
            </Card>
        );
        const todoList = (
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

        return (
            <div>
                {todoInput}
                {todoList}
            </div>
        );
    }
}

export default TodosController;
