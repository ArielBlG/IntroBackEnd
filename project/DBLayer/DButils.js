require("dotenv").config();
const sql = require("mssql");

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

exports.getAllUsers = async function (){
  const users = await execQuery(
    "SELECT user_id FROM dbo.Users"
    );

    return users;
}
exports.getUserIDByID = async function (username){
  const user_ID = await execQuery(
    `select user_id from dbo.Users where user_id='${username}'`
  );
  return user_ID[0];
}
exports.getUserDetailsByID = async function(username){
  const user = await execQuery(
    `select * from dbo.Users where user_id = '${username}'`
  )
  return user[0];
}

exports.execQuery = execQuery;
// process.on("SIGINT", function () {
//   if (pool) {
//     pool.close(() => console.log("connection pool closed"));
//   }
// });

// poolConnect.then(() => {
//   console.log("pool closed");

//   return sql.close();
// });

// exports.execQuery = function (query) {
//   return new Promise((resolve, reject) => {
//     sql
//       .connect(config)
//       .then((pool) => {
//         return pool.request().query(query);
//       })
//       .then((result) => {
//         // console.log(result);
//         sql.close();
//         resolve(result.recordsets[0]);
//       })
//       .catch((err) => {
//         // ... error checks
//       });
//   });
// };
