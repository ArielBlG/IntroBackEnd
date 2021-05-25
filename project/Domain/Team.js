const DButils = require("../DBLayer/DButils");

function Team(team_id, team_name, Expense, Status, Coach, Stadium, TeamOwner){
    this.team_id = team_id || "null";
    this.team_name = team_name || "null";
    this.Expense = Expense || "null";
    this.Status = Status || "null";
    this.Coach = Coach || "null";
    this.Stadium = Stadium || "null";
    this.TeamOwner = TeamOwner || "null";
};