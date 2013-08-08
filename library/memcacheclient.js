var memcacheConfig = require('./../config/memcache');
var memcache = require('memcache');

console.log(memcacheConfig);

mcClient = new memcache.Client(memcacheConfig.host, memcacheConfig.port);
//mcClient.addHandler(onConnect);
console.log('start');
mcClient.connect();
var mmclient = module.exports;

/**
 * init database
 */
mmclient.set = function(key, callback) {
	mcClient.set(key, 'hello \r\n node-memcache', function(err, response) {
		mcClient.get(key, function(err, data) {
			mcClient.close();
			callback(err, data);
		});
	});
};

