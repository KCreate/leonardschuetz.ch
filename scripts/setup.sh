#!/bin/bash

# Create some dirs and files, excluded by git
mkdir server/resources/versionedDocuments
touch server/config.json; echo '{"password": "testpw1234"}' > server/config.json
touch server/todos/data.json; echo '{"todos": []}' > server/todos/data.json

# Log
echo "You can now configure [server/config.json]"
echo "You can now configure [server/todos/data.json]"
