
module.exports.generate = function(error,message,status,data){
	var myResponse = {
        error: error,
        message: message,
        status: status,
        ata: data
    };
    return myResponse;
};