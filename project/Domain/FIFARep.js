const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User");
const RegisterObj = require("../Domain/Register");
const TeamObj = require("../Domain/Team");

function FIFARep(user_id, password, firstName, lastName, email, imgURL){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
}

async function addGameToSystem(req){
    homeTeam = await TeamObj.getTeam(req.body.homeTeam);
    awayTeam = await TeamObj.getTeam(req.body.awayTeam);
    // check if teams exists in db
    if(homeTeam && awayTeam){
        //check if game id already in DB
        let output_id = await DButils.execQuery(
            `
            SELECT game_id from dbo.Games
            WHERE game_id = '${req.body.id}' 
            ` 
        )
        //checks if a team is playing this date
        let output_team_games = await DButils.execQuery(
            `
            SELECT * from dbo.Games
            WHERE (HomeTeam = '${req.body.homeTeam}' AND Time = '${req.body.date}')
                    or (awayTeam ='${req.body.awayTeam}' AND time  = '${req.body.date}')

            ` 
        )
        //checks if the game is already in db.
        if(output_id.length == 0 && output_team_games.length == 0){
            await DButils.execQuery(
                `insert into dbo.Games
                (Time, HomeTeam, AwayTeam, Stadium, game_id)
                VALUES
                ('${req.body.date}','${req.body.homeTeam}','${req.body.awayTeam}','${req.body.stadium}','${req.body.id}')`
            );
            return 200;
        }else{
            return 400;
        }
    }
    else{
        return 400;
    }
}

async function addRefereeToSystem(req){//TODO: ADD CHECKS FOR INPUT!!
    //create regular base user for users table
    RegisterObj.createUser(req);//TODO: add response status to user add
    var CheckRemainder = true;
    if (CheckRemainder){
        //creates Referee user for Referees table
        await DButils.execQuery(
            `insert into dbo.Referees
            (user_id, Degree, Role)
            VALUES
            ('${req.body.user_id}','${req.body.Degree}','${req.body.Role}')`
        );
        return 200;
    }
    else{
        return 400;
    }
}

FIFARep.prototype = new UserObj.User();
FIFARep.prototype.constructor = FIFARep;
exports.addGameToSystem = addGameToSystem;
exports.addRefereeToSystem = addRefereeToSystem;