var express = require('express')
  , routes = require('./routes')
  , app = require('express')()
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , tagg = require('tagg2')
  , user = require('./routes/user')
  , connect = require('connect')
  , cookie = require('cookie')
  , parseSignedCookie = connect.utils.parseSignedCookie
  , memoryStore = connect.middleware.session.MemoryStore
  , game = require('./model/game');


// all environments
app.set('port', process.env.PORT || 1200);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({
	secret: 'secret',
	store: memStore = new memoryStore()
}));

app.use(app.router);//要放在bodyParser之后，处理post
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

/*
setInterval(function() {
  io.sockets.emit('SYS_SYN_RES', { "res": new Date().getTime() });
}, 10000);
*/


io.set('authorization', function(handshakeData, callback){
	// 通过客户端的cookie字符串来获取其session数据
	handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);
	var connect_sid = parseSignedCookie(handshakeData.cookie['connect.sid'], 'secret');
	console.log(connect_sid);
	console.log(memStore);
	if (connect_sid) {
		memStore.get(connect_sid, function(error, session){
			if (error) {
				// if we cannot grab a session, turn down the connection
				callback(error.message, false);
			}
			else {
				// save the session data and accept the connection
				handshakeData.session = session;
				callback(null, true);
			}
		});
	}
	else {
		callback('nosession');
	}
});

io.sockets.on('connection', function (socket) {

	//初始化发包
	socket.emit('SYS_SYN_RES', { "res": new Date().getTime() });//发送时间包
	game.getGameList(function(err, games){
		for(var i in games)
		{
			io.sockets.emit('SYS_CURR_GAME_RES', games[i]);//发送各种游戏状态包
		}
	
	});

	/*
	socket.on('reset', function (data) {
		countdown = 1000;
		io.sockets.emit('timer', { countdown: countdown });
	});
	

	socket.on('USER_TO_SYN', function () {
		socket.emit('SYS_SYN_RES', { "res": new Date().getTime() });
	});

	*/

});

//测试
var mysqlClient = require('./library/mysqlclient').init();

var sql = "SELECT * FROM bet_award_type WHERE id = 1 or id = 8 or id = 3 or id = 4 or id = 6";
//var sql = "SELECT * FROM bet_award_type WHERE type_id = 8";
var args = null;
var buf = new Array();
var lottery = new Array();
mysqlClient.query(sql,args,function(err, res){
	if(!err !== null){
		for (var i in res){
			//console.log(new Date(Math.round(new Date().getTime() / 1000 + 110) * 1000 ) );
			buf[i] = new Buffer(res[i].id.toString());
			
			
			lottery[i] = require('./controller/lottery');
			lottery[i].init(res[i]);
			/*
			lottery[i].getAwardTimeout();
			//lottery[i].onNextAwardTime(function(seconds){
				//console.log(seconds);
			//});
			lottery[i].getAward(function(err, newAwards){
				if (!err)
				{
					for ( var i in newAwards )
					{
						console.log(newAwards[i]);
					}
				}else{
					console.log("Got error: " + err);
				}
				
			});
			
			*/
		}

		/*begin=============================采集开奖结果开始================================begin*/
		var th_getAward = function(){
			var lottery = require('./controller/lottery');
			var mysqlClient = require('./library/mysqlclient').init();
			var sql = "SELECT * FROM bet_award_type WHERE id = " + thread.buffer.toString();
			var args = null;
			//console.log(sql);
			mysqlClient.query(sql,args,function(err, res){
				lottery.init(res[0]);//初始化
				lottery.onNextAwardTime(function(seconds){
					console.log("we hold on for " + seconds + " seconds.");
					console.log(thread.buffer.toString() + " thread beggin.");
					
					var getAward = setTimeout(function(){
						lottery.getAward(function(err, newAwards){
							if (!err)
							{
								for ( var i in newAwards )
								{
									console.log(newAwards[i]);
								}
							}else{
								console.log("Got error: " + err);
							}
							var data = {"typeId" : thread.buffer.toString(), "lotteryType" : lottery.lotteryType, "err" : err, "res" : newAwards};
							//clearTimeout(getAwardTimeout);
							thread.end(JSON.stringify(data)); //when thread over, the string "buffer.toString" will transfer to main nodejs thread.
							
						});
					}, 1000 * seconds + 1000);
					/**/
				});
			});
		}


		var awardThread = tagg.create({poolsize:10, fastthread:false});//create a pool which size of 10.
		for (var i in buf){
			awardThread.pool(th_getAward, buf[i], function(err, res){
				sendAward(err, res);
			});
		}

		var sendAward = function(err, res){
			if(err) throw(err);//thread occur some errors
			var data = eval(res);
			console.log(data.typeId + " thread end.");//this will be print "thread over"

			//thread.destroy();//destory the whole thread pool
			if (data.res && data.res.length > 0 )
				io.sockets.emit('SYS_CURR_RESULT', data);

			awardThread.pool(th_getAward, new Buffer(data.typeId.toString()), function(err, res){
				sendAward(err, res);
			});
		}

		/*end=========================采集开奖结果结束================================end*/



		/*begin======================发送游戏时间开始================================begin*/
		var th_getTime = function(){
			var game = require('./model/game');//子线程必须独立引用
			game.getGameByCode(thread.buffer.toString(), function(err, res){
				if (!err)
				{
					//延时发送时间结果
					console.log("send game " + thread.buffer.toString() +" time after " + res.timeout + " senconds.");
					setTimeout(function(){
						game.getGameByCode(thread.buffer.toString(), function(err, res){
							if (!err)
								thread.end(JSON.stringify(res));
						});
						
					}, 1000 * (res.timeout + 1));
				}else{
					thread.end(err);
				}
			});
		}


		var timeThread = tagg.create({poolsize:10, fastthread:false});//create a pool which size of 10.
		for (var i in buf){
			timeThread.pool(th_getTime, buf[i], function(err, res){
				sendTime(err, res);
			});
		}

		var sendTime = function(err, res){
			if(err) throw(err);//thread occur some errors
			var data = eval(res);
			io.sockets.emit('SYS_CURR_GAME_RES', data);
			awardThread.pool(th_getTime, new Buffer(data.code.toString()), function(err, res){
				sendTime(err, res);
			});
		}
	} 
	else{
		console.log(err.message);
	}
});