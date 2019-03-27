var express = require('express');
var session = require('express-session');
var responseGenerator = require('./../../libs/responseGenerator');
var crypto = require('./../../libs/crypto');
var key = "JAICRYPTO-AES256"
var auth = require("./../../middlewares/auth");
var users = express.Router();
var cors = require('cors');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var multer = require('multer');
var mysql = require("mysql");
var fs = require('fs');
var s3Upload = require ('aws-s3');

var token;
const s3ProductUpload = require('./../../store/s3Upload');

// express router
var userRouter  = express.Router();
process.env.SECRET_KEY = "ecommerce";
module.exports.controllerFunction = function(app,connection){
    //////////////////////////api to logout//////////////////////////
    var logout = function() {
        return function (req, res, next) {
            req.logout();
            delete req.session;
            next();
        };
    };
    userRouter.get('/logout',function(req,res){
      req.session.destroy(function(err) {
        res.redirect('/');
      });
    });//end logout
    /////////////////api to get all user details//////////////////////////
    userRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }else{
                var myResponse = responseGenerator.generate(false,"retrieved successfully",200,allUsers);
                res.send(myResponse);
            }
        });
    });
    ///////////////////////////api to checklogin///////////
    userRouter.post('/checklogin', expressJwt({secret:process.env.SECRET_KEY}),function(req,res){
      res.send({login:true})
    });
    ////////////////////////////////api to login///////////
    userRouter.post('/login', function(req, res) {
        var appData = {};
        var admin_email= req.body.admin_email;
        var admin_password = req.body.admin_password;
        console.log("????????",req.body)
        var token = req.body.token;
        
            connection.query("SELECT * FROM `admin_tbl` WHERE admin_email = '" + req.body.admin_email + "' AND admin_password = '" + req.body.admin_password + "'", function(err, rows, fields) {
                console.log(">>>>>>>>>",rows)
                if (err) {
                    appData.error = 1;
                    appData["data"] = "Error Occured!";
                    res.status(400).json({"error":1,"data":"error occurred"});
                }else{
                        //console.log("myconsole",rows[0].admin_password ,admin_password,rows[0].admin_password == admin_password)
                        if (rows.length > 0) {
                            if (rows[0].admin_password == admin_password) {
                                let obj = Object.assign({},rows[0])
                                let token = jwt.sign(obj, process.env.SECRET_KEY, {
                                    expiresIn: 1440
                                });

                                console.log("------------------------------------------------->>>>>>",token);
                                appData.error = 0;
                                appData["token"] = token;
                                console.log("------------------------------------------------->>>>>>",appData);
                                res.status(200).json(appData);
                            }else {
                                appData.error = 1;
                                appData["data"] = "Email and Password does not match";
                                res.status(204).json({"error":1,"data":"Email and Password does not match"});
                            }
                        }else {
                            appData.error = 1;
                            appData["data"] = "Email does not exists!";
                            res.status(204).json({"error":1,"data":"Email does not exists"});
                        }
                    }
            });
    });

    ////////////////////////////////api to login api///////////
    userRouter.get('/loginapi', function(req,res){
	console.log("-------------------");
        connection.query(`SELECT * FROM  admin_tbl `, function (err, result, fields) {
            if (err) {
                throw err;
                console.log('========================',err);
                res.send({success:false,message:'no data found'})
            }else{
            console.log(result);
            res.send({success:true,data:result})
            }
        });
    });
    ////////////////////////////////api for frontend catalog//////////////////
    userRouter.post('/catalog' , function(req,res){
        var page_number = req.body.page_number;
        var offset = 10 * (page_number -1);
        var product_id = req.body.product_id;
        console.log("bhahh",offset);
        console.log("hii",page_number);
        console.log("gggggg",product_id);
        var query =" SELECT * FROM Product_Catalog LIMIT 10 " ;
        // var product_desc = req.body.product_desc;
        // var product_imageUrl = req.body.product_desc;
        connection.query(query, function(err,result,fields){

            if (err) {
                throw err;
                console.log('=================',err);
                res.send({success:false,message:'null'})
            }else{
                console.log(result);
                res.send({success:true,data:result})
            }
        });
    });
    ////////////////////////////////api to catalog///////////
    userRouter.post('/catalogview', function(req,res){
        var product_id = req.body.product_id;
        var product_desc = req.body.product_desc;
        var product_minnimum_order = req.body.product_minnimum_order;
        var product_imageUrl = req.body.product_imageUrl;
        var product_price = req.body.product_price;
        var product_Quantity_Available = req.body.product_Quantity_Available;
        var query = " SELECT * FROM Product_Catalog ";
        connection.query( query, function (err, result, fields) {
            if (err) {
                throw err;
                console.log('========================',err);
                res.send({success:false,message:'null'})
            }else{
            console.log(result);
            res.send({success:true,data:result})
            }
        });
    });
    //////////////////////////api for edit product////////////////////////
    userRouter.post('/updateproduct',function(req,res){
        //console.log("Query :: ", req.query);
        //console.log("Body :: ", req.body);
    // var product_id = req.body.product_id;
     var product_desc = parseInt(req.body.product_desc);
     var product_minnimum_order = req.body.product_minnimum_order;
     var product_price = req.body.product_price;
     var product_Quantity_Available = req.body.product_Quantity_Available;
     var product_imageUrl = parseInt(req.body.product_imageUrl);
     
     const query = "Update Product_Catalog set product_imageUrl = '" + req.body.product_imageUrl + "', product_desc = '" + req.body.product_desc + "', product_minnimum_order = '" + req.body.product_minnimum_order + "' , product_price = '" + req.body.product_price + "' ,product_Quantity_Available = '" +  req.body.product_Quantity_Available +  "' where product_id = '" + req.body.product_id + "' ";
     
     console.log(query);

     connection.query(query,function(err,result,fields){
        if (err) {
            throw err;
            console.log('=======Error========',err);
            res.send({success:false,message:'null'})
        }else{
            console.log(result);
            res.send({success:true,data:result})
        }
     });
    });
    ///////////////////////////api for add//////////////////////////////
    userRouter.post('/addproduct',function(req,res){
        console.log("bhahh",req);
        var product_id = parseInt(req.body.product_id);
        console.log("product_id",product_id);
        var product_desc = req.body.product_desc;
        var product_minnimum_order = req.body.product_minnimum_order;
        var product_price = req.body.product_price;
        var product_Quantity_Available = req.body.product_Quantity_Available;
        var product_imageUrl = req.body.product_imageUrl;
        const query = "INSERT INTO `Product_Catalog` (`product_id`,`product_desc`,`product_minnimum_order`,`product_price`,`product_Quantity_Available`,`product_imageUrl`) VALUES( '" + req.body.product_id + "','" + req.body.product_desc + "','" + req.body.product_minnimum_order + "','" + req.body.product_price + "','" + req.body.product_Quantity_Available + "','" + req.body.product_imageUrl + "')";
        connection.query(query,function(err,result,fields){
            if (err) {
                throw err;
                console.log('=========Error=========',err);
                res.send({success:false,message:'null'})
            }else{
                console.log(result);
                res.send({success:true,data:result});
                console.log("1 record inserted");
            }
        });
    });
    ///////////////////////////api for customer delivery details/////////
    userRouter.post('/delivery' , function(req,res){
        var name = req.body.name;
        var email = req.body.email;
        var mobile = req.body.mobile;
        var city = req.body.city;
        var address = req.body.address;
        var state = req.body.state;
        var country = req.body.country;
        var zip = req.body.zip;
        var query = "INSERT INTO `deliverydetails` (`name`,`email`,`mobile`,`city`,`address`,`state`,`country`,`zip`) VALUES( '" + req.body.name + "','" + req.body.email + "','" + req.body.mobile + "','" + req.body.city + "','" + req.body.address + "','" + req.body.state + "','" + req.body.country + "','" + req.body.zip + "')";
        console.log("query",query);
        connection.query(query,function(err,result,fields){
            if (err) {
                throw err;
                console.log('=========Error=========',err);
                res.send({success:false,message:'null'})
            }else{
                console.log(result);
                res.send({success:true,data:result})
            }
        });
    });
   
    ///////////////////////////api for delete product///////////////////
    userRouter.post('/deleteproduct',function(req,res){

        var product_id = req.body.product_id;
        console.log("hope so",req.body.product_id);
        //var product_id = parseInt(req.body.product_id);
        const query ="DELETE FROM `Product_Catalog` WHERE `product_id` = '" + req.body.product_id + "'";
       console.log(query);
        connection.query(query,function(err,result,fields){
            if (err) {
                throw err;
                console.log('=============Error===========',err);
                res.send({success:false,message:'null'})
            }else{
                console.log(result);
                res.send({success:true,data:result})
            }
        });
    });
    //////////////////////////api for multer////////////////////////////
    const storage = multer.diskStorage({
    destination: (req, file, cb, filename ) => {
       let dir = '';
        if(['jpeg','png','jpg','bmp'].indexOf(file.originalname.split('.').pop()) > -1){
           dir = './ProductPictureUploads/';
          // dir = 'https://" + uploadOfImageByKaustav + ".s3-us-west-1.amazonaws.com/" + users + '/' + filename';
           if (!fs.existsSync(dir)){
               fs.mkdirSync(dir);
            }
           let tempName = file.originalname.replace(/ /g,'_');
           var product_id = parseInt(req.body.product_id);
           tempName = tempName.split('.');
           // tempName[0] = req.user.product_id + '_Product_Catalog';
           tempName[0] = req.body.product_id + '_Product_Catalog';
           file.originalname = tempName.join('.');
        }
        cb(null, dir)
    },
        filename: (req, file, cb) =>{
           let user_id =  req.body.user_id;
           cb(null, file.originalname)
        }
    });
    ///////////////////api for multer////////////////

    const maxSize = 1 * 1024 * 1024;
    const upload = multer({ storage:storage,limits: { fileSize: maxSize } }).single('file');
    userRouter.post('/uploadProductImage',function (req, res, next){
        //var email=req.body.email;
        var product_id;
        new Promise((resolve, reject)=>{
            upload(req, res, (err) => {
                console.log(req.body)
                product_id = parseInt(req.body.product_id);
                if(req.file == 'undefined' || req.file == undefined){
                    reject("Please upload file less than 1MB.");
                }else if(req.file.size > 1000000){
                    reject("Please upload file less than 1MB.");
                }else{
                    let file_name = req.file.originalname;
                    file_name = file_name.replace(/ /g,'_').split('.');
                    file_name[0] = product_id + '_Product_Catalog';
                    file_name = file_name.join('.');
                    if(err){
                        reject(err);
                    }else{//console.log('coming here to resolve the file ', file_name);
                        resolve(file_name);
                    }
                }
            })
        }).then(async (filename)=>{
                const product_imageUrl = req.body.product_imageUrl;
                const bucketName = "product-imageurl-test-ecomm"
                let resposePath = "https://" + bucketName + ".s3-us-west-1.amazonaws.com/" + product_id + '/' + filename;               
                const query1 = "Update `Product_Catalog` set `product_imageUrl` = '" + resposePath   + "' where `product_id` = '" + product_id + "'";
                   console.log("bhhhh",query1);
                    connection.query(query1, function (err, result, fields) {
                    if (err) {
                            throw err;
                            console.log('========================',err);
                            res.send({success:false,message:'null'})
                        }else{
                            //error 
                             //console.log(result);
                            // res.send({success:true,data:result})
                        }
                    });
                    let success;
                    try{
                       success = await s3ProductUpload.upload(bucketName , filename, path.resolve("./ProductPictureUploads") + '/', product_id)
                       res.json({status : true, data :resposePath ,'message' : 'Product image uploaded successfully'})
                       console.log(resposePath);
                       console.log("success",success);
                    }catch(err){
                       console.log({err})
                       return res.json({'status': false, 'message' : 'Product image updation failed'});
                    }
        }).catch((err) =>{
           console.log(err,"************************")
        })
    });
    app.use('/api/v1/users', userRouter);
};
