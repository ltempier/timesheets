"use strict";

const express = require("express");

var router = express.Router();
var db = require('./db');

router.route('/')
    .post()
    .get(function (req, res) {
        db.getProjects(function (err, results) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(200).json(results);
            }
        });
    });
router.route('/:id')
    .put()
    .delete()
    .get();

module.exports = router;

