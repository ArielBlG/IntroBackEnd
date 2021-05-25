var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const UserClass = require("../Domain/Login")
const registerClass = require("../Domain/Register")

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
    const user = await UserClass.getUser(req.body.id, req.body.password);

    // check that username exists & the password is correct
    console.log(user);
    if (!(await UserClass.checkPassword(req.body.password,user))) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;

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
