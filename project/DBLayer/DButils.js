require("dotenv").config();
const sql = require("mssql");
/**
 * configuration of the Data base
 */
const config = {
  user: process.env.db_userName,
  password: process.env.db_passWord,
  server: process.env.db_server,
  database: process.env.db_name,
  options: {
    encrypt: true,
    enableArithAbort: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
/**
 * Function that queries the DB
 */
async function execQuery(query) {
// exports.execQuery = async function (query) {

  await poolConnect;
  try {
    var result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};
/**
 * Function that returns all users from User Table
 */
exports.getAllUsers = async function (){
  const users = await execQuery(
    "SELECT user_id FROM dbo.Users"
    );

    return users;
}
/**
 * Function that returns a specific user id from a user from the User Table
 */
exports.getUserIDByID = async function (username){
  const user_ID = await execQuery(
    `select user_id from dbo.Users where user_id='${username}'`
  );
  return user_ID[0];
}
/**
 * Function that returns all details from a specific  from a user from the User Table
 */
exports.getUserDetailsByID = async function(username){
  const user = await execQuery(
    `select * from dbo.Users where user_id = '${username}'`
  )
  return user[0];
}

exports.execQuery = execQuery;

