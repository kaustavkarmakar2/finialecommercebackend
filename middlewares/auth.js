var mysql = require("mysql");
// app level middleware to set request user
exports.setLoggedInUser = function(req,res,next,connection){
console.log('i ran',req.session)
	if(req.session && req.session.user){
		connection.query("SELECT * FROM `admin_tbl` WHERE admin_email = '" + req.session.admin_email + "' AND admin_password = '"+req.session.admin_password+"'", function (err, user, fields) {

			if(user){
				req.user = user[0];
				delete req.user.password;
				req.session.user = user[0];
				delete req.session.user.password;

				next()
			}
			else{
				// do nothing , because this is just to set the values
			}
		});
	}
	else{
		next();
	}
}
exports.checkLogin = function(req,res,next){
	if(!req.user && !req.session.user){
		res.status(200).send({"loginStatus":false});
	}
	else{
		next();
	}
}// end checkLogin
