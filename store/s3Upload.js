const AWS = require('aws-sdk');
const async = require('async');
//const bucketName = "cq-upload-profile"
const path = require('path');
const fs = require('fs');
//let pathParams, image, imageName;

/** Load Config File */
AWS.config.loadFromPath('./config/s3bucketConfig.json');

/** After config file load, create object for s3*/
const s3 = new AWS.S3({region: 'us-west-1'})

let createMainBucket = (productimageUrltest) => {
	// Create the parameters for calling createBucket
	const bucketParams = {
		Bucket : productimageUrltest
	};
	return new Promise((resolve,reject) =>{
		s3.headBucket(bucketParams, function(err, data) {
			if (err) {
				console.log("ErrorHeadBucket", err)
				s3.createBucket(bucketParams, function(err, data) {
					if (err) {
						console.log("Error", err)
						reject(err);
					} else {
						resolve(data)
					}
				});
			} else {
				resolve(data)
			}
		 })
	})
}

const deleteObjectFromBucket = (productimageUrltest, objectKey) => {
	const bucketParams = {
		Bucket : productimageUrltest,
		Key : objectKey
	};
	return new Promise((resolve, reject) =>{
		s3.deleteObject(bucketParams, function(err, data) {
			if (err) {
				//console.log("deleteObject", err)
				reject(err);
			} else {
				resolve(data)
			}
		 })
	})
}

const createItemObject = (profilepicturewqtest, imageName, image) => {
  const params = {
        Bucket: profilepicturewqtest,
        Key: `${imageName}`,
        ACL: 'public-read',
        Body:image
	};
	return new Promise((resolve, reject) =>{
		s3.putObject(params, function (err, data) {
			if (err) {
				console.log("Error uploading image: ", err);
				reject(err);
			} else {
				console.log("Successfully uploaded image on S3", data);
				resolve(data);
			}
		})
	})
}

const upload = async (productimageUrltest, filename, filepath, option) => {
	var tmp_path = filepath + filename;
	let image = fs.createReadStream(tmp_path);
	let imageName = option + '/' + filename;
	try{
		await createMainBucket(productimageUrltest);
	}catch(err){
		return(false)
	}
	try{
		await createItemObject(productimageUrltest,imageName, image);
	}catch(err){
		return(false)
	}
	fs.unlinkSync(filepath + filename);
	return(true)
}
module.exports = {
	upload: upload
}
