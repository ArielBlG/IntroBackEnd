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
function FIFARep(user_id, password, firstName, lastName, email, imgURL) {
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
}
/**
 * The method that is responsibles to add game and varify the details
 * @param {requestObject} req 
 */
async function addGameToSystem({ body: { homeTeam, awayTeam, mainRef, assRef1, assRef2, id, date, stadium, league, stage } }) {
    homeTeam = await TeamObj.getTeam(homeTeam);
    awayTeam = await TeamObj.getTeam(awayTeam);
    main_ref = await RefObj.getReferee(mainRef);
    assistant_ref_1 = await RefObj.getReferee(assRef1);
    assistant_ref_2 = await RefObj.getReferee(assRef2);

    // Checks if one of the teams doesn't exists in the system
    if (!homeTeam) {
        throw { status: 400, message: "The Home Team Doesn't exists in the system." };
    }
    if (!awayTeam) {
        throw { status: 400, message: "The Away Team Doesn't exists in the system." };
    }

    //Checks if one of the referees doesn't exists in the system
    if (!main_ref) {
        throw { status: 400, message: "The Main Referee doesn't exists in the system." };
    }
    if (!assistant_ref_1) {
        throw { status: 400, message: "The first assistant Referee doesn't exists in the system." };
    }
    if (!assistant_ref_2) {
        throw { status: 400, message: "The second assistan Referee doesn't exists in the system." };
    }

    //Checks if the referee's Role matches the role that was recevied
    if (main_ref.Role !== "Main") {
        throw { status: 400, message: "Main Referee Role Doesn't fit" };
    }
    if (assistant_ref_1.Role !== "Assistent") {
        throw { status: 400, message: "The first assistan Referee's Role doesn't fit." };
    }
    if (assistant_ref_2.Role !== "Assistent") {
        throw { status: 400, message: "The second assistan Referee's Role doesn't fit." };
    }

    //check if theres a game already with the recevied id
    let output_id = await DButils.execQuery(
        `
        SELECT game_id from dbo.Games
        WHERE game_id = '${id}' 
        `
    )
    if (output_id.length !== 0) {
        throw { status: 400, message: "The Game ID already exists in the system" }
    }
    //checks if a team is playing this date
    let output_team_games = await DButils.execQuery(
        `
        SELECT * from dbo.Games
        WHERE (Time = '${date}' AND (HomeTeam = '${homeTeam.team_name}'
                OR AwayTeam ='${awayTeam.team_name}' ))

        `
    )
    if (output_team_games.length !== 0) {
        throw { status: 400, message: "One of the teams has game in this Date" };
    }
    //check if the referees are having games at the same timeout
    let output_ref_games = await DButils.execQuery(
        `
        SELECT * from dbo.Games
        WHERE (Time= '${date}' AND
            (MainReferee = '${mainRef}' OR AssistantReferee1 ='${assRef1}' OR AssistantReferee2 ='${assRef2}'
            OR AssistantReferee1 ='${assRef2}' OR AssistantReferee2 ='${assRef1}'))

        `
    )
    if (output_ref_games.length !== 0) {
        throw { status: 400, message: "One of the Referees has game in this Date" };
    }
    await DButils.execQuery(
        `insert into dbo.Games
        (Time, HomeTeam, AwayTeam, Stadium, game_id, MainReferee, AssistantReferee1, AssistantReferee2, league, stage )
        VALUES
        ('${date}','${homeTeam}','${awayTeam}','${stadium}','${id}', '${mainRef}','${assRef1}', '${assRef2}', '${league}', '${stage}' )`
    );
}
/**
 * The method that is responsibles to add referee and varify the details
 * @param {requestObject} req 
 */
async function addRefereeToSystem(req) {
    var Check = false;
    //if it is not of type Referee, return error
    if (req.body.userType != 'Referee') {
        throw { status: 406, message: "only Referee type user is allowed" };
    }

    //now we check that unique Referee fields are correct.
    const Role = req.body.Role;
    const Degree = req.body.Degree

    if (!(Role == 'Main' || Role == 'Assistent')) {
        throw { status: 406, message: "only Referee Roles : Assistent or Main are allowed" };
    }
    if (!(Degree == 'Novice' || Degree == 'Veteren' || Degree == 'Expert')) {
        throw { status: 406, message: "only Referee Degree : Novice or Veteren or Expert are allowed" };
    }

    try {//create regular base user for users table
        // check username exists
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
    }
    catch (error) {
        throw (error);
    }
}

FIFARep.prototype = new UserObj.User();
FIFARep.prototype.constructor = FIFARep;
exports.addGameToSystem = addGameToSystem;
exports.addRefereeToSystem = addRefereeToSystem;