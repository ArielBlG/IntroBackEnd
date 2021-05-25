var express = require('express');
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const users_utils = require("../Domain/User");
const players_utils = require("../Domain/Referee");

router.get("/temp" , async (req, res, next) => {
    console.log("TO BE WRITTEN");
})

module.exports = router;