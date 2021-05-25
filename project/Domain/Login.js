var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const bcrypt = require("bcryptjs");


async function getUser(username) {
    const user_ID = await DButils.execQuery(
      `select user_id from dbo.Users where user_id='${username}'`
    );
    return user_ID[0];
  }

async function checkPassword(password,username) {
    const user_password = (await DButils.execQuery(
        `select password from dbo.Users where user_id='${username.user_id}'`
      ))[0].password;
      console.log(user_password);
    if (!username || !bcrypt.compareSync(password, user_password)) {
        return false;
      }
    return true;
    
}

exports.getUser = getUser;
exports.checkPassword = checkPassword;