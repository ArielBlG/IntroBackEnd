const DButils = require("../DBLayer/DButils");

/**
 * Constructor for the User (super) object
 * @param {string} user_id 
 * @param {string} password 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} imgURL 
 * @param {string} country 
 */
var User = function(user_id, password, firstName, lastName, email, imgURL, country){
  this.firstName = firstName || "null";
  this.lastName = lastName || "null";
  this.user_id = user_id || "null";
  this.email = email || "null";
  this.imgURL = imgURL || "null";
  this.password = password || "null";
  this.country = country || "null";
}


exports.getFullName = User.prototype.getFullName = async function(){
  console.log(this.firstName);
};
/**
 * Add player as favorite for a user
 */
async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id})`
  );
}
/**
 * get player as favorite for a user
 */
async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}

exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
// exports.getFullName = User.prototype.getFullName;
exports.User = User;
// http://localhost:3000/users/getUserName