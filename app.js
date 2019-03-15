var express = require('express');
var app = express();
// module for maintaining sessions
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var responseGenerator = require('./libs/responseGenerator');
var mysql = require("mysql");
var flash = require('connect-flash');
var crypto = require('crypto');
var LocalStrategy = require('passport-local').Strategy;
var cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
// path is used the get the path of our files on the computer
var path = require ('path');
app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
var allowCrossDomain = function (req, res, next) {
   res.header('Access-Control-Allow-Credentials', true);
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
   res.setHeader('Access-Control-Allow-Methods', '*');
   res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
   res.setHeader('Access-Control-Max-Age', '1000');
   next();
};
app.use(allowCrossDomain);
//initialization of session middleware
app.use(cookieParser());
app.set('trust proxy',1);
app.use(session({
  name :'myCustomCookie',
  secret: 'myAppSecret', // encryption key
  resave: true,
  httpOnly : true,
  saveUninitialized: true,
  cookie: { secure: true },
  cookie:{maxAge:1000*60*60*24}
}));
 //sql connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'wq',
  password : 'root',
  database:  'ecommerce',
});
module.exports.connection = connection;
app.use(flash());
// fs module, by default module for file management in nodejs
var fs = require('fs');
var auth = require("./middlewares/auth");
//////////////////////setting session of current logged in user////////////////////
app.use(function(req,res,next){
 auth.setLoggedInUser(req,res,next,connection);
});
// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app,connection)
	}
});//end for each
// Get content endpoint
app.get('/dashboard', function (req, res){
  res.status(200).send(req.cookies);
  res.send("You can only see this after you've logged in.");
});
/////////////////////////error handling illegal routes/////////////////////////////
app.use(function(err, req, res, next){
  if(res.status == 404){
    var myResponse = responseGenerator.generate(false,"You hit an incorrect path. Check again",404,null);
    res.send(myResponse);
  }else {
      var myResponse = responseGenerator.generate(true,err,500,null);
      res.send(myResponse);
    }
});
app.listen(3000, function (){
  console.log('Example app listening on port 3000!');
});
