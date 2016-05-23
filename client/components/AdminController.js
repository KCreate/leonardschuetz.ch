// Dependencies
import React, { Component, PropTypes } from 'react';
import ProtoController from './ProtoController';
import Card from './Card';
import FileCard from './FileCard';
import get from '../../utils/get';

class AdminController extends ProtoController {

    constructor(...args) {
        super(...args);
        this.listFiles = this.listFiles.bind(this);
        this.handleUpload = this.handleUpload.bind(this);

        this.state = Object.assign({}, this.state, {
            title: 'Admin',
            navigation: [
                ['admin', 'Admin'],
            ],
            files: [],
            status: false,
        });

        this.listFiles();
    }

    listFiles() {
        get('/documents', 'GET', {}, (err, res) => {
            this.setState({
                files: JSON.parse(res),
            });
        });
    }

    handleUpload(event) {
        event.preventDefault();

        // Clear the error message
        this.setState({
            status: false,
        });

        // Construct the payload
        const payload = new FormData(event.target);

        // Upload the file
        get('/documents', 'POST', {
            payload,
            noJSON: true,
            onprogress: (event) => {
                this.setState({
                    status: {
                        text: parseInt((100 / event.total) * event.loaded, 10),
                        type: 'progress',
                    },
                });
            },
        }, (err, response) => {

            if (err) return console.log(err);
            response = JSON.parse(response);

            // Error handling
            if (response.error) {
                return this.setState({
                    status: {
                        text: response.error,
                        type: 'error',
                    },
                });
            }

            // Clear the form and rerender the document list
            this.refs.uploadForm.reset();
            this.setState({
                status: {
                    text: 'Successfully uploaded file!',
                    type: 'success',
                },
            });
            this.listFiles();
        });
    }

    content(navItems, routerParams, routerPath) {

        const fileCards = this.state.files.map((file, index) => (
            <FileCard key={index} file={file}></FileCard>
        ));

        let statusIndicator;
        if (this.state.status) {
            const className = ({
                progress: 'blueText',
                error: 'redText',
                success: 'greenText',
            })[this.state.status.type];

            statusIndicator = (
                <p className={className}>{this.state.status.text}</p>
            );
        }

        return (
            <div>
                <Card>
                    # Upload File
                    {statusIndicator}
                    <form onSubmit={this.handleUpload} ref="uploadForm">
                        <input type="file" name="file"></input>
                        <input type="password" name="password" placeholder="Password"></input>
                        <input type="submit" value="Upload"></input>
                    </form>
                </Card>
                {fileCards}
            </div>
        );
    }
}

export default AdminController;
