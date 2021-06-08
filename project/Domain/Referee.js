const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User")
/**
 * Constructor for the referee object
 * @param {string} user_id 
 * @param {string} password 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} imgURL 
 * @param {string} Degree 
 * @param {string} Role 
 */
function Referee(user_id, password, firstName, lastName, email, imgURL, Degree, Role){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
    this.Degree = Degree;
    this.Role = Role;
}
/**
 * The function returns object referee out of the data base
 * @param {String} referee 
 */
async function getReferee(referee){
    const ref = await DButils.execQuery(
        `select * from dbo.Referees where user_id='${referee}'`
      );
      return ref[0];
}
Referee.prototype = new UserObj.User();
Referee.prototype.constructor = Referee;

exports.getReferee = getReferee;
