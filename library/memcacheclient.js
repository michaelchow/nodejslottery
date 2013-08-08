var memcacheConfig = require('./../config/memcache');
var memcache = require('memcache');



mcClient = new memcache.Client(memcacheConfig.host, memcacheConfig.port);
//mcClient.addHandler(onConnect);
console.log(memcacheConfig);
mcClient.connect();
console.log('start');
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

memclient.close = function() {
	mcClient.close();
};