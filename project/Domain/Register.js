var express = require("express");
var router = express.Router();
const DButils = require("../DBLayer/DButils");
const bcrypt = require("bcryptjs");
/**
 * Function that validates whether a given id already exists in the system
 * @param {string} username 
 */
async function validateUser(username) {
  const users = await DButils.getAllUsers();
  if (users.find((x) => x.user_id === username)) {
    throw { status: 409, message: "Username taken" };
  }
  return 'success';
}
/**
 * The function that creates the object, also encrypting the password
 * @param {request object} req 
 */
async function createUser(req) {
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
  if (req.body.userType === "FifaRep") {
    await DButils.execQuery(
      `INSERT INTO dbo.Represntetives 
          (user_id)
          VALUES
          ('${req.body.user_id}')`
    );
  }
}
exports.validateUser = validateUser;
exports.createUser = createUser;

