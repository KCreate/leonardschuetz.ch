# Preparing for development
Run the following script to generate some needed directories and files
```sh
$ npm run setup
```

You should now configure this file: `server/config.json`

The keys privateKey and certificate are paths to the HTTPS private-key and certificate respectively.

Make sure your `NODE_ENV` environment variable is set to _`development`_.

Starting the app in development mode now goes as follows:
```sh
# Using nodemon to automatically reload the server
$ npm run serve

# Not using nodemon
$ npm run start
```

# Preparing for production
Run the setup script.

Make sure your `NODE_ENV` environment variable is set to _`development`_.

You can now start the app using the following command:
```sh
$ npm run prod
```
