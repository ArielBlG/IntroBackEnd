const DButils = require("../DBLayer/DButils");

function User(user_id, password, firstName, lastName, email, imgURL){
  this.firstName = firstName || "null";
  this.lastName = lastName || "null";
  this.user_id = user_id || "null";
  this.email = email || "null";
  this.imgURL = imgURL || "null";
  this.password = password || "null";
};

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id})`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}

exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.User = User;
