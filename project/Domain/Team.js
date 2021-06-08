const DButils = require("../DBLayer/DButils");
/**
 * Constructor for the Team object
 * @param {string} team_id 
 * @param {string} team_name 
 * @param {int} Expense 
 * @param {string} Status 
 * @param {string} Coach 
 * @param {string} Stadium 
 * @param {string} TeamOwner 
 */
var Team = function(team_id, team_name, Expense, Status, Coach, Stadium, TeamOwner){
    this.team_id = team_id || "null";
    this.team_name = team_name || "null";
    this.Expense = Expense || "null";
    this.Status = Status || "null";
    this.Coach = Coach || "null";
    this.Stadium = Stadium || "null";
    this.TeamOwner = TeamOwner || "null";
}
/**
 * function that returns a Team object from the data base
 * @param {string} team_name 
 */
async function getTeam(team_name){
    const team = await DButils.execQuery(
        `select * from dbo.Teams where team_name='${team_name}'`
      );
      return team[0];
}

exports.getTeam = getTeam;
exports.Team = Team;