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
            progress: false,
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
                    progress: parseInt((100 / event.total) * event.loaded, 10),
                });
            },
        }, (err, response) => {

            if (err) return console.log(err);
            response = JSON.parse(response);

            // Error handling
            if (response.error) {
                return this.setState({
                    status: response.error,
                    progress: false,
                });
            }

            // Clear the form and rerender the document list
            this.refs.uploadForm.reset();
            this.setState({
                status: 'Successfully uploaded file!',
                progress: false,
            });
            this.listFiles();
        });
    }

    content(navItems, routerParams, routerPath) {

        const fileCards = this.state.files.map((file, index) => (
            <FileCard key={index} file={file}></FileCard>
        ));

        let progressIndicator;
        if (this.state.progress) {
            progressIndicator = (
                <p className="blueText">{this.state.progress}% Uploaded</p>
            );
        }

        let statusIndicator;
        if (this.state.status) {
            statusIndicator = (
                <p className="redText">{this.state.status}</p>
            );
        }

        return (
            <div>
                <Card>
                    # Upload File
                    {statusIndicator}
                    {progressIndicator}
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
