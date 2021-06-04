const DButils = require("../DBLayer/DButils");

var Team = function(team_id, team_name, Expense, Status, Coach, Stadium, TeamOwner){
    this.team_id = team_id || "null";
    this.team_name = team_name || "null";
    this.Expense = Expense || "null";
    this.Status = Status || "null";
    this.Coach = Coach || "null";
    this.Stadium = Stadium || "null";
    this.TeamOwner = TeamOwner || "null";
}

async function getTeam(team_name){
    const team = await DButils.execQuery(
        `select * from dbo.Teams where team_name='${team_name}'`
      );
      return team[0];
}

exports.getTeam = getTeam;
exports.Team = Team;