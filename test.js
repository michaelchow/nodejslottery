var mcClient = require('./library/memcacheclient');


mcClient.set('test', 'wawwwwwwwwwwwww', function(err, data){
	mcClient.get('test', function(err, data){
		console.log(data);
		mcClient.get('test', function(err, data){
			console.log(data);
			mcClient.get('test', function(err, data){
				console.log(data);
			});
		});
	});
	console.log(data);

});


mcClient.get('test222222', function(err, data){
	console.log(data);
});

mcClient.close();
/*
var memcache = require('memcache');


mcClient = new memcache.Client();
mcClient.connect();
//mcClient.addHandler(onConnect);





var util      = require('util');
var setKey = function() {
	mcClient.set('test', 'hello \r\n node-memcache', function(err, response) {
		mcClient.get('test', function(err, data) {
			util.debug(data);
			mcClient.close();
		});
	});
};

setKey();
*/
//mcClient.connect();
//setKey();
