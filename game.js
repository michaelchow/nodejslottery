/**
 * Export the constructor.
 */
var async = require('async'),
	ok = require("assert"),
	eq = require("assert").equal,
	tz = require("timezone"),
	mysqlClient = require('./mysqlclient').init();

var Game = exports = module.exports = {};


Game.getGameByCode = function (gameCode, callback) {

	var _this = this;
	var game;
	//同步执行mysql返回
	async.series([
		function(step){
			// do some more stuff ...
			console.log("test begin: ");
			_this.GetGameStatusByCode(gameCode, function(err, res){
				if (res == 2)
				{
					game = {"code" : gameCode, "draw" : 0, "endTime" : new Date().getTime(), "startTime" : new Date().getTime(), "timeout" : 0, "status" : 1};
					return callback(null, game);
				}
				step(null, 'one');//执行下一步
			});
		},
		function(step){
			// do some more stuff ...
			_this.GetCorrectAwradByTypeId(gameCode, function(err, res){
				console.log("test end: ");
			});
		}
	],
	// optional callback
	function(err, results){
		// results is now equal to ['one', 'two']
	});

}


Game.GetGameStatusByCode = function (gameCode, callback) {
	var sql = "SELECT status FROM bet_award_type WHERE type_id = " + gameCode;
	var args = null;
	mysqlClient.query(sql,args,function(err, res){
		return callback(null, res[0].status);
	});
}



Game.GetCorrectAwradByTypeId  = function (typeId, callback) {
	var sql = "SELECT a.award_id FROM bet_award AS a, bet_award_type AS at WHERE a.award_type_id = " + typeId + " AND a.award_type_id = at.type_id ORDER BY a.award_id DESC LIMIT 1";
	var args = null;
	var lastAwrad;
	mysqlClient.query(sql,args,function(err, res){
		if (res == "")
		{
			return callback(null, null);
		}else{
			lastAwrad = res[0].award_id;
			var drawSeconds;
			var openTime;
			var allowance = 10; //对比容差时间秒数
            var sampleCount = 20;//抽样对比开奖结果总条数

			async.series([
				function(step){
					var args = null;
					var sql = "SELECT * FROM bet_award_type WHERE type_id = " + typeId;
					mysqlClient.query(sql,args,function(err, res){
						drawSeconds = res[0].draw_seconds;
						//console.log(openTime);
						var kenotz = tz(require("timezone/" + res[0].time_zone));
						openTime = kenotz(new Date().Format("yyyy-MM-dd ") + res[0].open_time, res[0].time_zone);
						step(null, 'one');//执行下一步
					});
					
				},
				function(step){
					var args = null;
					var sql = "SELECT * FROM bet_award AS a LEFT JOIN bet_award_type AS at ON a.award_type_id = at.type_id WHERE a.award_type_id = " + typeId + " AND at.status != 2 AND a.award_id <= " + lastAwrad + " ORDER BY a.award_next_round_time DESC, a.award_draw DESC LIMIT 0, " + sampleCount;
					console.log(sql);
					mysqlClient.query(sql,args,function(err, res){
						for (var i in res){
							console.log(res[i]);
						}



						return callback(null, res);
						step(null, 'two');//执行下一步
					});

				}
			],
			// optional callback
			function(err, results){
				// results is now equal to ['one', 'two']
			});

			//return callback(null, res[0].award_id);
		}

	});


}

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}