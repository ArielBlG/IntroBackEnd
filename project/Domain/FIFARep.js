const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User")
const TeamObj = require("../Domain/Team");

function FIFARep(user_id, password, firstName, lastName, email, imgURL){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
}

async function addGameToSystem(req){
    homeTeam = TeamObj.getTeam(req.body.homeTeam);
    home_team = new TeamObj.Team(homeTeam.id, homeTeam.team_name, homeTeam.expenses, "null", homeTeam.Coach, homeTeam.Stadium, homeTeam.TeamOwner);
    awayTeam = TeamObj.getTeam(req.body.awayTeam);
    away_team = new TeamObj.Team(awayTeam.id, awayTeam.team_name, awayTeam.expenses, "null", awayTeam.Coach, awayTeam.Stadium, awayTeam.TeamOwner);
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