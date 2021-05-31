var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const loginClass = require("../Domain/Login");
const userClass = require("../Domain/User");
const registerClass = require("../Domain/Register");
const bcrypt = require("bcryptjs");

router.get("/Register", async (req, res) => {
  res.send("Register");
});

router.post("/Register", async (req, res, next) => {
  console.log("Register-post");
  console.log(req.body);
  try {
    // parameters exists
    // valid parameters
    // username exists
    await registerClass.validateUser(req.body.user_id);

    //create the user
    await registerClass.createUser(req);

    res.status(201).send("user created");
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  console.log("Login");
  try {
    // get User from DB
    const userID = await loginClass.getUser(req.body.id, req.body.password);

    // check that username exists & the password is correct
    if (!(await loginClass.checkPassword(req.body.password,userID))) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = userID.user_id
    let userFullDetails = await DButils.getUserDetailsByID(userID.user_id);
    // user_id, password, firstName, lastName, email, imgURL, country
    req.session.cur_user = new userClass.User(userFullDetails.user_id, userFullDetails.password, userFullDetails.first_name, userFullDetails.last_name, userFullDetails.email, userFullDetails.imgURL, userFullDetails.country);
    console.log(req.session.cur_user);

    // return cookie
    res.status(200).send("login succeeded");
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
