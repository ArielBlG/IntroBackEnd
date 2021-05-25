var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const bcrypt = require("bcryptjs");

async function validateUser(username){
    const users = await DButils.execQuery(
        "SELECT user_id FROM dbo.Users"
        );
    if (users.find((x) => x.user_id === username)){
        throw { status: 409, message: "Username taken" };
    }
}

async function createUser(req){
    //hash the password
    let hash_password = bcrypt.hashSync(
        req.body.password,
        parseInt(process.env.bcrypt_saltRounds)
      );
      req.body.password = hash_password;
  
      // add the new username
      await DButils.execQuery(
        `INSERT INTO dbo.Users 
        (user_id, password, email, country, first_name, last_name, img_url, userType) 
        VALUES
        ('${req.body.user_id}', '${hash_password}','${req.body.email}','${req.body.country}','${req.body.firstName}','${req.body.lastName}','${req.body.imgURL}', '${req.body.userType}')`
      );
}
exports.validateUser = validateUser;
exports.createUser = createUser;
// guard
