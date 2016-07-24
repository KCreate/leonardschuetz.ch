#!/bin/bash

# Create ignored directories
mkdir server/resources/versionedDocuments
mkdir server/livechat/tmp
mkdir server/logs

# Create configuration files
touch server/config.json; echo '{
    "password": "testpw1234",
    "portHTTP": 80,
    "portPROD": 443,
    "portDEV": 3000
}' > server/config.json
touch server/todos/data.json; echo '{
    "todos": []
}' > server/todos/data.json

# Log
echo "You can now configure [server/config.json]"
echo "You can now configure [server/todos/data.json]"
