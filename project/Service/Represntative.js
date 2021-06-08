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
/**
 * The middlewear that controls the post add game to system
 */
router.post('/addGameToSystem', async (req, res, next) => {
    try{
        await FIFARepClass.addGameToSystem(req);
        res.status(200).send("OK. All details delivered");
        // if(out == 200){
        //   res.status(out).send("OK. All details delivered");
        // }
        // else{
        //   if(out == 400){
        //     res.status(out).send("Bad request");
        //   }
        // }
    } catch (error) {
        next(error);
    }
});
/**
* The middlewear that controls the get add game to system
 */
router.post('/addRefereeToSystem', async (req, res, next) => {
  try{
      let out = await FIFARepClass.addRefereeToSystem(req);
      if(out == 200){
        res.status(out).send("OK. All details delivered");
      }
      else{
        if(out == 400){
          res.status(out).send("Bad request");
        }
      }
  } catch (error) {
      next(error);
  }
});
module.exports = router;