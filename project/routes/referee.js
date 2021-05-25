var express = require('express');
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/referee_utils");


router.get('/Register', async(req, res, next) => {
  res.send("afsa");
});
router.post("/Register", async (req, res, next) => {
    try {
      // parameters exists
      // valid parameters
      // username exists
      const users = await DButils.execQuery(
        "SELECT username FROM dbo.Referees"
      );
  
      if (users.find((x) => x.username === req.body.username))
        throw { status: 409, message: "Username taken" };
  
      //hash the password
      let hash_password = bcrypt.hashSync(
        req.body.password,
        parseInt(process.env.bcrypt_saltRounds)
      );
      req.body.password = hash_password;
  
      // add the new username
      await DButils.execQuery(
        `INSERT INTO dbo.Referees (username, password) VALUES ('${req.body.username}', '${hash_password}')`
      );
      res.status(201).send("user created");
    } catch (error) {
      next(error);
    }
  });

module.exports = router;