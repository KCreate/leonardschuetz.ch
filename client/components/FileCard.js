// Dependencies
import React, { Component, PropTypes } from 'react';
import Card from './Card';

class FileCard extends Component {
    render() {
        return (
            <Card>
                {'# ' + this.props.file.filename}
                Available versions of this file:
                <ul>
                    {this.props.file.versions.map((version, index) => {
                        const link = '/documents/' + this.props.file.filename + '/' + version.time;

                        return (
                            <li key={index}>
                                <a href={link}>{version.htime}</a> - {version.size / 1000}KB
                            </li>
                        );
                    })}
                </ul>
                <a href={'/documents/' + this.props.file.filename}>Download newest version</a>
            </Card>
        );
    }
}

export default FileCard;
