var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const bcrypt = require("bcryptjs");
var User = require("../Domain/User");


async function getUserID(username) {
    const user_ID = await DButils.getUserIDByID(username);
    return user_ID;
  }

async function checkPassword(password,username) {
    const user_password = (await DButils.execQuery(
        `select password from dbo.Users where user_id='${username.user_id}'`
      ))[0].password;
    if (!username || !bcrypt.compareSync(password, user_password)) {
        return false;
      }
    return true;
    
}

exports.getUser = getUserID;
exports.checkPassword = checkPassword;