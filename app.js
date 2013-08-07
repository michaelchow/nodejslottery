var express = require('express')
  , routes = require('./routes')
  , app = require('express')()
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , tagg = require('tagg2')
  , user = require('./routes/user');


// all environments
app.set('port', process.env.PORT || 1200);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

console.log(app.get('port'));
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var countdown = 1000;
setInterval(function() {
  countdown--;
  io.sockets.emit('timer', { countdown: countdown });
}, 1000);

io.sockets.on('connection', function (socket) {
  socket.on('reset', function (data) {
    countdown = 1000;
    io.sockets.emit('timer', { countdown: countdown });
  });
});

var data = {
		"roundPattern" : "\"phase\":\"(\\d{6,10})\"", 
		"numbersPattern" : "\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\",\"(\\d{2})\"",
		"timePattern" : "\"time_draw\":\"\\d{4}-\\d{2}-\\d{2} (\\d{2}):(\\d{2}):(\\d{2})",
		"url" : "http://baidu.lecai.com/lottery/ajax_latestdrawn.php?lottery_type=543",
		"afficheTypeId" : "1",
		"timeZone" : "China Standard Time",
		"roundSeconds" : "300",
		"roundType" : "Normal",
}

/*
var data = {
		"roundPattern" : "(\\d+),\\d{2},\\d{2},\\d{2};", 
		"numbersPattern" : "(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2}),(\\d{1,2})",
		"timePattern" : "(\\d{2}),(\\d{2}),(\\d{2});",
		"url" : "https://www.acttab.com.au/interbet/kenoreswin",
		"afficheTypeId" : "8",
		"timeZone" : "AUS Eastern Standard Time",
		"roundSeconds" : "210",
		"roundType" : "AddDateBeforeRound",
}
*/


//≤‚ ‘
var mysqlClient = require('./mysqlclient').init();
var sql = "select * from bet_award_type where type_id = 1";
var args = null;
var keno = new Array();
var buf = new Array();
mysqlClient.query(sql,args,function(err, res){
	if(err !== null){
		console.log(err.message);
		//utils.invokeCallback(cb, err.message, null);
	} 
	else {
		for (var i in res){
			//console.log(res[i]);
			buf[i] = new Buffer(i.toString());
			keno[i] = require('./keno');
			keno[i].init(res[i]);
			keno[i].getAwardTimeout();
		}



		var th_func = function(s){
			/*
			var sleep = function(d){
			  for(var t = Date.now();Date.now() - t <= d;);
			}
			*/
			
			console.log(thread.buffer.toString() + " thread beggin.");

			setTimeout(function(){
				thread.end(thread.buffer.toString()); //when thread over, the string "buffer.toString" will transfer to main nodejs thread.
			}, 4000 * thread.buffer.toString()+ 1000);

			//sleep(4000 * thread.buffer.toString()+ 1000);
			
			

		}
		var thread = tagg.create({poolsize:10, fastthread:false});//create a pool which size of 10.
		for (var i in buf){
			thread.pool(th_func, buf[i], function(err, res){
				callback(err, res);
			});
		}

		var callback = function(err, res){
			if(err) throw(err);//thread occur some errors
			console.log(res + " thread end.");//this will be print "thread over"
			//thread.destroy();//destory the whole thread pool

			thread.pool(th_func, buf[parseInt(res)], function(err, res){
				callback(err, res);
			});
		}


	}
});


