const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User")

function FIFARep(user_id, password, firstName, lastName, email, imgURL){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
}

async function addGameToSystem(req){
    await DButils.execQuery(
        `insert into dbo.Games
        (Time, HomeTeam, AwayTeam, Stadium, game_id)
        VALUES
        ('${req.body.date}','${req.body.homeTeam}','${req.body.awayTeam}','${req.body.stadium}','${req.body.id}')`
    );
}
FIFARep.prototype = new UserObj.User();
FIFARep.prototype.constructor = FIFARep;
exports.addGameToSystem = addGameToSystem;