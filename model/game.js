/**
 * Export the constructor.
 */
var tz = require("timezone"),
	memcacheClient = require('./../library/memcacheclient'),
	myutil = require("./../library/myutil"),
	mysqlClient = require('./../library/mysqlclient').init(),
	fs = require('fs');

var Game = exports = module.exports = {};

Game.getGameByCode = function (gameCode, callback) {

	var _this = this;
	var game = {"code" : gameCode, "draw" : 0, "waitSeconds" : 0, "endTime" : new Date().getTime(), "startTime" : new Date().getTime(), "timeout" : 0, "status" : 0};

	// do some more stuff ...
	_this.getGameStatusByCode(gameCode, function(err, res){
		if (res == 0)
		{
			return callback(null, game);
		}

		var drawLen;
		// do some more stuff ...
		_this.getCorrectAwradByCode(gameCode, function(err, res){
			//console.log(res);
			if (res != null)
			{
				game.draw = res.award_draw;
				if (game.draw.toString().indexOf(new Date().Format("yyyyMMdd")) == 0 || game.draw.toString().indexOf(new Date(new Date().getTime() - 60*60*24*1000).Format("yyyyMMdd")) == 0)
				{
					game.draw = game.draw.toString().substr(8);
					drawLen = game.draw.length;//保存期数长度 然后再数字运算
					game.draw++;
					
					if (Date.parse(new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyy-MM-dd")) - Date.parse(new Date().Format("yyyy-MM-dd")) == 60 * 60 * 24 * 1000)
					{//如果跨天，那么斯洛伐克这种自动计算开奖期数就要从1开始 860 * 60 * 24 是一整天秒数
						if (res.draw_type == 'AutoGenerateByTime' )
						{
							//如果跨天，那么斯洛伐克这种自动计算开奖期数就要从1开始
							if (game.draw > 60 * 60 * 24 / res.draw_seconds)
							{
								game.draw = game.draw - 60 * 60 * 24 / res.draw_seconds;
							}
						}
					}else{
						game.draw = myutil.zeroFill(game.draw, drawLen);
					}
					game.draw = new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyyMMdd") + game.draw;//加上日期
				}else{
					game.draw++;
				}
				game.waitSeconds = res.wait_seconds;
				game.code = res.award_type_id;
				game.endTime = res.next_draw_time + res.delay_seconds;//单位为秒
				game.startTime = game.endTime - res.draw_seconds;//单位秒
				game.timeout = Math.floor(game.endTime - new Date().getTime() / 1000);//单位为秒
				game.status = game.timeout > game.waitSeconds ? 1 : 2; //状态  1投注 2为等待
	
				if (game.timeout < 0)//如果已经过期了则跳过 算出当前期数
				{
					var addDraw = Math.floor((new Date().getTime() /1000 - (res.next_draw_time + res.delay_seconds)) / res.draw_seconds );
					addDraw = addDraw < 0 ? 0 : addDraw;
					addDraw++;//至少要加一期
					console.log( addDraw );
					if (game.draw.toString().indexOf(new Date().Format("yyyyMMdd")) == 0 || game.draw.toString().indexOf(new Date(new Date().getTime() - 60*60*24*1000).Format("yyyyMMdd")) == 0 || game.draw.toString().indexOf(new Date(new Date().getTime() + 60*60*24*1000).Format("yyyyMMdd")) == 0)
					{
						game.draw = game.draw.toString().substr(8);
						drawLen = game.draw.length;//保存期数长度 然后再数字运算
						game.draw = parseInt(game.draw) + addDraw;
						
						if (Date.parse(new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyy-MM-dd")) - Date.parse(new Date().Format("yyyy-MM-dd")) == 60 * 60 * 24 * 1000)
						{//如果跨天，那么斯洛伐克这种自动计算开奖期数就要从1开始 860 * 60 * 24 是一整天秒数
							if (res.draw_type == 'AutoGenerateByTime' )
							{
								//如果跨天，那么斯洛伐克这种自动计算开奖期数就要从1开始
								if (game.draw > 60 * 60 * 24 / res.draw_seconds)
								{
									game.draw = game.draw - 60 * 60 * 24 / res.draw_seconds;
								}
							}
						}else{
							game.draw = myutil.zeroFill(game.draw, drawLen);
						}
						game.draw = new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyyMMdd") + game.draw;//加上日期
					}else{
						game.draw = parseInt(game.draw) + addDraw;
					}
					/*============begin 游戏刚开始时 不需要加期数 期数为结束时的期数 +1 ============== */
					var kenotz = tz(require("timezone/" + res.time_zone));
					var kenoDate = tz(new Date().getTime(), "%F ", res.time_zone); //拿到当前时区的日期
					var openTime = kenotz(kenoDate + res.open_time, res.time_zone); //算出游戏开始的时间

					var passedSeconds = (new Date().getTime() - openTime) / 1000;
					if( passedSeconds > 0 && passedSeconds < res.draw_seconds){
						game.draw++;
					}
					/*============end   游戏刚开始时 不需要加期数 期数为结束时的期数 +1 ============== */
					game.endTime = res.next_draw_time + res.delay_seconds + res.draw_seconds * addDraw;
					game.startTime = game.endTime - res.draw_seconds;
					game.timeout = Math.floor(game.endTime - new Date().getTime() / 1000);
					game.status = game.timeout > game.waitSeconds ? 1 : 2; //状态  1投注 2为等待
				}
			}
			//console.log(game);
			return callback(null, game);
		});
	});
}

//得到游戏状态
Game.getGameStatusByCode = function (gameCode, callback) {
	var sql = "SELECT status FROM bet_award_type WHERE type_id = " + gameCode;
	var args = null;
	mysqlClient.query(sql,args,function(err, res){
		console.log(res);
		return callback(null, res[0].status);
	});
}
//插入新开奖结果
Game.insertAward = function (index, draw, typeId, numbers, time, next_time, callback) {
	var sql = "SELECT * FROM bet_award WHERE award_type_id = " + typeId + " AND award_draw = '" + draw + "'"
	var args = null;
	if(typeof(numbers) == 'undefined' || typeof(draw) == 'undefined'){
		return callback(null, {"index" : index, "award" : null} );
	}
	mysqlClient.query(sql,args,function(err, res){
		if (res.length > 0)
		{
			//已经存在就不返回插入成功
			return callback(null, {"index" : index, "award" : null});
			//return callback(null, {"index" : index, "award" : {"typeId" : typeId, "draws" : draw, "numbers" : numbers }});
			
		}else{
			var sql = "INSERT INTO `bet_award` (`award_draw`, `award_numbers`, `draw_time`, `standard_draw_time`, `next_draw_time`, `award_type_id`) VALUES ('" + draw + "', '" + numbers + "', " + Math.round(new Date().getTime() / 1000) + ", " + time + ", " + next_time + ", " + typeId + ")";
			var args = null;
			mysqlClient.query(sql,args,function(err, res){
				if (!err)
					return callback(null, {"index" : index, "award" : {"typeId" : typeId, "draw" : draw, "numbers" : numbers }});
				else
					return callback(err, {"index" : index, "award" : null} );
			});
		
		}
	});
}

/*得到正确的参照开奖记录
return err, result
*/
Game.getCorrectAwradByCode  = function (typeId, callback) {
	var sql = "SELECT MAX(a.award_id) AS last_id FROM bet_award AS a, bet_award_type AS at WHERE a.award_type_id = " + typeId + " AND a.award_type_id = at.type_id";
	var args = null;
	var lastAwrad;
	mysqlClient.query(sql,args,function(err, res){
		if (!res.length)
		{
			return callback(null, null);
		}else{
			lastAwrad = res[0].last_id;
			var allowance = 10; //对比容差时间秒数
            var sampleCount = 20;//抽样对比开奖结果总条数

				memcacheClient.get("correct_affiche_" + typeId + "_" + lastAwrad, function( err, value ){
					if(value){
						//console.log("used cache");
						var res = eval("(" + value + ")");
						//console.log(res);
						return callback(null, res);
					}else{
						console.log("not used cache");
						//清除cache
						memcacheClient.get("last_affiche_" + typeId, function( err, value ){
							if(value){
								memcacheClient.get( "correct_affiche_" + typeId + "_" + value, function( err, result ){
									if(result){
										memcacheClient.delete( "correct_affiche_" + typeId + "_" + value , function( err, res ){
											if( !err ){
											console.log( res ); // 1
											// ... do something ...
											}
										});
									}
								});
							}
						});
						//设置当前最后一期的cache
						memcacheClient.set( "last_affiche_" + typeId, lastAwrad.toString(), function( err, success ){
							if( !err && success ){
								console.log( success );
								// true
								// ... do something ...
							}
						});

						var args = null;
						var sql = "SELECT * FROM bet_award AS a LEFT JOIN bet_award_type AS at ON a.award_type_id = at.type_id WHERE a.award_type_id = " + typeId + " AND at.status != 2 AND a.award_id <= " + lastAwrad + " ORDER BY a.next_draw_time DESC, a.award_draw DESC LIMIT " + sampleCount;
						var j = 0;
						mysqlClient.query(sql,args,function(err, res){
							if (!err)
							{
								for(var i = 0; i<res.length - 2 ; i++){

									var drawSeconds = res[i].draw_seconds;
							//console.log(openTime);
									var kenotz = tz(require("timezone/" + res[0].time_zone));
									var kenoDate= tz(new Date().getTime(), "%F ", res[i].time_zone);//拿到当前时区的日期
									var openTime = kenotz(kenoDate + res[i].open_time, res[i].time_zone);//算出游戏开始的时间
									var sub1 = Math.abs(res[i].next_draw_time - res[i+1].next_draw_time - drawSeconds);
									var sub2 = Math.abs(res[i+1].next_draw_time - res[i+2].next_draw_time - drawSeconds);
									//拿3期做对比 在容差范围内 && 开始4期以上 && 必须是今天的 视作合格
									//console.log(Date.parse(new Date().Format("yyyy-MM-dd")));
									//console.log(Date.parse(res[i].next_draw_time) >  Date.parse(new Date().Format("yyyy-MM-dd 00:00:00")));
									if (sub1 <= allowance && sub2 <= allowance && ( new Date().getTime() - openTime)  / 1000 > drawSeconds * 4 && res[i].next_draw_time * 1000 >  Date.parse(new Date().Format("yyyy-MM-dd 00:00:00")) )
									{
										memcacheClient.set( "correct_affiche_" + typeId + "_" + lastAwrad.toString(), JSON.stringify(res[i]), function( err, success ){
											if( !err && success ){
												console.log( "sucucced set cache :" );
												console.log(res[i]);
												memcacheClient.get( "correct_affiche_" + typeId + "_" + lastAwrad.toString(), function( err, value ){
													console.log( "sucucced get cache :"  );
													console.log(value);
												});
											}
										});
										return callback(null, res[i]);
									}
								}
								if (res.length >0)
								{
									memcacheClient.set( "correct_affiche_" + typeId + "_" + lastAwrad.toString(), JSON.stringify(res[0]), function( err, success ){
										if( !err && success ){
											return callback(null, res[0]);
										}
									});
								}
								else
								{
									return callback(null, null);
								}
							}else{
								console.log(err);
							}
						});
					}
				});

			//return callback(null, res[0].award_id);
		}

	});
}

//得到游戏最新下一期开奖
Game.getNextAwardTimeByCode = function (typeId, callback) {
	var sql = "SELECT MAX(next_draw_time) AS time FROM bet_award WHERE award_type_id = " + typeId;
	var args = null;
	mysqlClient.query(sql,args,function(err, res){
		callback(err, res[0].time);
	});

}


//得到所有游戏列表
Game.getGameList = function (callback) {
	var sql = "SELECT * FROM bet_award_type ORDER BY order_id";
	var args = null;
	var _this = this;
	mysqlClient.query(sql,args,function(err, res){
		for(var i in res)
		{
			_this.getGameByCode(res[i].type_id, function(err, data){
			
			console.log(data);
			});

		}

		//return callback(null, res[0].status);
	});
}

eval(fs.readFileSync('./library/dateformat.js').toString());