#!/bin/bash

# Create ignored directories
mkdir server/resources/versionedDocuments
mkdir server/livechat/tmp
mkdir server/logs

# Configuration file
touch server/config.json; echo '{
    "password": "testpw1234",
    "portPROD": 3000,
    "portDEV": 3000
}' > server/config.json

# Database for the todos app
touch server/todos/data.json; echo '{
    "todos": []
}' > server/todos/data.json

# Log
echo "You can now configure [server/config.json]"
echo "You can now configure [server/todos/data.json]"
