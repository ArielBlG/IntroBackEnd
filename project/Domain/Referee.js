const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User")

function Referee(user_id, password, firstName, lastName, email, imgURL, Degree, Role){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
    this.Degree = Degree;
    this.Role = Role;
}
Referee.prototype = new UserObj.User();
Referee.prototype.constructor = Referee;
