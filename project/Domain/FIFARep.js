const DButils = require("../DBLayer/DButils");
const UserObj = require("../Domain/User")

function FIFARep(user_id, password, firstName, lastName, email, imgURL){
    UserObj.User.call(this, user_id, password, firstName, lastName, email, imgURL);
}
FIFARep.prototype = new UserObj.User();
FIFARep.prototype.constructor = Referee;