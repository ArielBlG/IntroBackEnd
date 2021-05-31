var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const users_utils = require("../Domain/User");
const FIFARepClass = require("../Domain/FIFARep");
const UserObj = require("../Domain/User");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
    console.log(req.session.user_id);
    if (req.session && req.session.user_id) {
      DButils.execQuery("SELECT user_id FROM Represntetives")
        .then((users) => {
            console.log(users);
          if (users.find((x) => x.user_id === req.session.user_id)) {
            req.user_id = req.session.user_id;
            next();
          }
          else{
              res.sendStatus(401);
          }
        })
        .catch((err) => next(err));
    } else {
      res.sendStatus(401);
    }
  });
router.get('/addGameToSystem', async (req, res, next) => {
    try{
        await FIFARepClass.addGameToSystem(req);
        req.send("OK. All details delivered");
    } catch (error) {
        next(error);
    }
});
module.exports = router;