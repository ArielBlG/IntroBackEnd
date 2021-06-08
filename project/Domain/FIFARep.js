const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User");
const RegisterObj = require("../Domain/Register");
const TeamObj = require("../Domain/Team");
const RefObj = require("../Domain/Referee");

/**
 * Fifa representitive constructor
 * @param {string} user_id 
 * @param {string} password 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} email 
 * @param {string} imgURL 
 */
function FIFARep(user_id, password, firstName, lastName, email, imgURL){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
}
/**
 * The method that is responsibles to add game and varify the details
 * @param {requestObject} req 
 */
async function addGameToSystem(req){
    homeTeam = await TeamObj.getTeam(req.body.homeTeam);
    awayTeam = await TeamObj.getTeam(req.body.awayTeam);
    main_ref = await RefObj.getReferee(req.body.mainRef);
    assistant_ref_1 = await RefObj.getReferee(req.body.assRef1);
    assistant_ref_2 = await RefObj.getReferee(req.body.assRef2);

    // check if teams and references exists in db
    if(homeTeam && awayTeam && main_ref && assistant_ref_1 && assistant_ref_2){
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
        //check if the referees are having games at the same timeout
        let output_ref_games = await DButils.execQuery(
            `
            SELECT * from dbo.Games
            WHERE (Time= '${req.body.date}' AND
             (MainReferee = '${req.body.mainRef}' OR AssistantReferee1 ='${req.body.assRef1}' OR AssistantReferee2 ='${req.body.assRef2}'
             OR AssistantReferee1 ='${req.body.assRef2}' OR AssistantReferee2 ='${req.body.assRef1}'))

            ` 
        )  
        //checks if the game is already in db.
        if(output_id.length == 0 && output_team_games.length == 0 && output_ref_games.length == 0){
            await DButils.execQuery(
                `insert into dbo.Games
                (Time, HomeTeam, AwayTeam, Stadium, game_id, MainReferee, AssistantReferee1, AssistantReferee2, league, stage )
                VALUES
                ('${req.body.date}','${req.body.homeTeam}','${req.body.awayTeam}','${req.body.stadium}','${req.body.id}', '${req.body.mainRef}','${req.body.assRef1}', '${req.body.assRef2}', '${req.body.league}', '${req.body.stage}' )`
            );
            // return 200;
        }else{
            throw { status: 400, message: "Team or Referee already has game this time" };
        }
    }
    else{
        throw { status: 400, message: "Team or Referee doesn't exists in the system" };
    }
}
/**
 * The method that is responsibles to add referee and varify the details
 * @param {requestObject} req 
 */
async function addRefereeToSystem(req){
    var Check= false;
    //if it is not of type Referee, return error
    if (req.body.userType != 'Referee'){
        return 400;
    }
    
    //now we check that unique Referee fields are correct.
    const Role = req.body.Role;
    const Degree =req.body.Degree

    if (
         (Role == 'Main'|| Role == 'Assistant')
         &&
         (Degree == 'Novice' || Degree == 'Veteren' || Degree == 'Expert' )
    ){
        Check= true;
    }
    
    if (Check){
        try {//create regular base user for users table
            // parameters exists
            // valid parameters
            // username exists
            await RegisterObj.validateUser(req.body.user_id);
        
            //create the user
            await RegisterObj.createUser(req);
            
            //creates Referee user for Referees table
            await DButils.execQuery(
                `insert into dbo.Referees
                (user_id, Degree, Role)
                VALUES
                ('${req.body.user_id}','${req.body.Degree}','${req.body.Role}')`
            );
            return 200;
        } 
        catch (error) {
            return 400;
        }
    }
    else{
        return 400;
    }
}

FIFARep.prototype = new UserObj.User();
FIFARep.prototype.constructor = FIFARep;
exports.addGameToSystem = addGameToSystem;
exports.addRefereeToSystem = addRefereeToSystem;