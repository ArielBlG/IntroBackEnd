var express = require("express");
var router = express.Router();
const league_utils = require("../Domain/League");

router.get("/getDetails", async (req, res, next) => {
  try {
    // res.send("getDetails");
    const league_details = await league_utils.getLeagueDetails();
    res.send(league_details);

  } catch (error) {
    next(error);
  }
});

module.exports = router;
