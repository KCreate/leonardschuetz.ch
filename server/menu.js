/* eslint-disable no-var */

// Dependencies
const express   = require('express');
const path      = require('path');
const request   = require('request');
const cheerio   = require('cheerio');
const router    = new express.Router();

const config = {
    source: 'http://www.cube-restaurant.ch/default.asp?page=7',
    baseUrl: 'http://www.cube-restaurant.ch/',
};

router.get('/', (req, res) => {
    request(config.source, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const $ = cheerio.load(body);

            // Extract all links from the html
            var links = [];
            $('td#content a').each(function(index, element) {
                links[index] = {
                    text: $(this).text(),
                    link: $(this).attr('href'),
                };
            });

            // Data modification
            links = links.map((item) => (
                Object.assign(item, {
                    text: item.text.trim(),
                    link: config.baseUrl + item.link.slice(3),
                })
            ));

            // Filter out unwanted links
            links = links.filter((item) => (
                item.text.match(/Move/)
            ));

            // If more than 1 link matched, send the list
            if (links.length > 1) {
                res.json({
                    links,
                });
            }

            // If only 1 link matched, download it
            if (links.length === 1) {
                res.redirect(links[0].link);
            }
        }
    });
});

module.exports = router;
