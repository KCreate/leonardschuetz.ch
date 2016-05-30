/* eslint-disable no-var */

// Dependencies
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const session   = require('express-session');
const router    = new express.Router();
const config    = require('./config.json');

// Initial Session
router.use(session({
    secret: config.password,
    name: 'SESSID',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
    },
}));

// Check if the user is logged in
router.use((req, res, next) => {

    // Only login if the user is not authenticated
    if (!req.session.authenticated) {

        // Defaults to false
        req.session.authenticated = false;

        // Check if a password was given
        if (req.body.password) {

            // Validate the password
            if (req.body.password === config.password) {
                req.session.authenticated = true;
            }
        }
    }

    req.session.save((err) => {
        if (err) throw err;
        next();
    });
});

router.use('/status', (req, res) => {
    res.json({
        authenticated: req.session.authenticated,
    });
});

module.exports = router;
