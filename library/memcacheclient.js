var memcacheConfig = require('./../config/memcache');
var memcache = require('memcache');

mcClient = new memcache.Client(memcacheConfig.host, memcacheConfig.port);
//mcClient.addHandler(onConnect);
mcClient.on('error', function(e){
	console.log("Memcache error : " + e.stack);
    // there was an error - exception is 1st argument
});


mcClient.connect();
//mcClient.close();
var memclient = module.exports;
/**
 * init database
 */
memclient.set = function(key, val, callback) {
	mcClient.set(key, val, function(err, response) {
		callback(err, response);
	});
};

memclient.get = function(key, callback) {
	mcClient.get(key, function(err, data) {
		callback(err, data);
	});
};

memclient.delete = function(key, callback) {
	mcClient.delete(key, function(err, data) {
		callback(err, data);
	});
};


memclient.close = function() {
	mcClient.close();
};