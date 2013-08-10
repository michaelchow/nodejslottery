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
	var game = {"code" : gameCode, "draw" : "0", "waitSeconds" : 0, "endTime" : new Date().getTime(), "startTime" : new Date().getTime(), "timeout" : 0, "status" : 0};

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
					drawLen = game.draw.length;//������������ Ȼ������������
					game.draw++;
					
					if (Date.parse(new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyy-MM-dd")) - Date.parse(new Date().Format("yyyy-MM-dd")) == 60 * 60 * 24 * 1000)
					{//������죬��ô˹�工�������Զ����㿪��������Ҫ��1��ʼ 860 * 60 * 24 ��һ��������
						if (res.draw_type == 'AutoGenerateByTime' )
						{
							//������죬��ô˹�工�������Զ����㿪��������Ҫ��1��ʼ
							if (game.draw > 60 * 60 * 24 / res.draw_seconds)
							{
								game.draw = game.draw - 60 * 60 * 24 / res.draw_seconds;
							}
						}
					}else{
						game.draw = myutil.zeroFill(game.draw, drawLen);
					}
					game.draw = new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyyMMdd") + game.draw;//��������
				}else{
					game.draw++;
				}
				game.waitSeconds = res.wait_seconds;
				game.code = res.award_type_id;
				game.endTime = res.next_draw_time + res.delay_seconds;//��λΪ��
				game.startTime = game.endTime - res.draw_seconds;//��λ��
				game.timeout = Math.floor(game.endTime - new Date().getTime() / 1000);//��λΪ��
				game.status = game.timeout > game.waitSeconds ? 1 : 2; //״̬  1Ͷע 2Ϊ�ȴ�
	
				if (game.timeout < 0)//����Ѿ������������� �����ǰ����
				{
					var addDraw = Math.floor((new Date().getTime() /1000 - (res.next_draw_time + res.delay_seconds)) / res.draw_seconds );
					addDraw = addDraw < 0 ? 0 : addDraw;
					addDraw++;//����Ҫ��һ��
					//console.log( addDraw );
					if (game.draw.toString().indexOf(new Date().Format("yyyyMMdd")) == 0 || game.draw.toString().indexOf(new Date(new Date().getTime() - 60*60*24*1000).Format("yyyyMMdd")) == 0 || game.draw.toString().indexOf(new Date(new Date().getTime() + 60*60*24*1000).Format("yyyyMMdd")) == 0)
					{
						game.draw = game.draw.toString().substr(8);
						drawLen = game.draw.length;//������������ Ȼ������������
						game.draw = parseInt(game.draw) + addDraw;
						
						if (Date.parse(new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyy-MM-dd")) - Date.parse(new Date().Format("yyyy-MM-dd")) == 60 * 60 * 24 * 1000)
						{//������죬��ô˹�工�������Զ����㿪��������Ҫ��1��ʼ 860 * 60 * 24 ��һ��������
							if (res.draw_type == 'AutoGenerateByTime' )
							{
								//������죬��ô˹�工�������Զ����㿪��������Ҫ��1��ʼ
								if (game.draw > 60 * 60 * 24 / res.draw_seconds)
								{
									game.draw = game.draw - 60 * 60 * 24 / res.draw_seconds;
								}
							}
						}else{
							game.draw = myutil.zeroFill(game.draw, drawLen);
						}
						game.draw = new Date(new Date().getTime() + (res.draw_seconds - res.delay_seconds) * 1000).Format("yyyyMMdd") + game.draw;//��������
					}else{
						game.draw = parseInt(game.draw) + addDraw;
					}
					/*============begin ��Ϸ�տ�ʼʱ ����Ҫ������ ����Ϊ����ʱ������ +1 ============== */
					var kenotz = tz(require("timezone/" + res.time_zone));
					var kenoDate = tz(new Date().getTime(), "%F ", res.time_zone); //�õ���ǰʱ��������
					var openTime = kenotz(kenoDate + res.open_time, res.time_zone); //�����Ϸ��ʼ��ʱ��

					var passedSeconds = (new Date().getTime() - openTime) / 1000;
					if( passedSeconds > 0 && passedSeconds < res.draw_seconds){
						game.draw++;
					}
					/*============end   ��Ϸ�տ�ʼʱ ����Ҫ������ ����Ϊ����ʱ������ +1 ============== */
					game.endTime = res.next_draw_time + res.delay_seconds + res.draw_seconds * addDraw;
					game.startTime = game.endTime - res.draw_seconds;
					game.timeout = Math.floor(game.endTime - new Date().getTime() / 1000);
					game.status = game.timeout > game.waitSeconds ? 1 : 2; //״̬  1Ͷע 2Ϊ�ȴ�
				}
				game.draw = game.draw.toString();//ת��Ϊ��������
			}
			//console.log(game);
			return callback(null, game);
		});
	});
}

//�õ���Ϸ״̬
Game.getGameStatusByCode = function (gameCode, callback) {
	var sql = "SELECT status FROM bet_award_type WHERE type_id = " + gameCode;
	var args = null;
	mysqlClient.query(sql,args,function(err, res){
		//console.log(res);
		return callback(null, res[0].status);
	});
}
//�����¿������
Game.insertAward = function (index, draw, typeId, numbers, time, next_time, callback) {
	var sql = "SELECT * FROM bet_award WHERE award_type_id = " + typeId + " AND award_draw = '" + draw + "'"
	var args = null;
	if(typeof(numbers) == 'undefined' || typeof(draw) == 'undefined'){
		return callback(null, {"index" : index, "award" : null} );
	}
	mysqlClient.query(sql,args,function(err, res){
		if (res.length > 0)
		{
			//�Ѿ����ھͲ����ز���ɹ�
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

/*�õ���ȷ�Ĳ��տ�����¼
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
			var allowance = 10; //�Ա��ݲ�ʱ������
            var sampleCount = 20;//�����Աȿ������������

				memcacheClient.get("correct_affiche_" + typeId + "_" + lastAwrad, function( err, value ){
					if(value){
						//console.log("used cache");
						var res = eval("(" + value + ")");
						//console.log(res);
						return callback(null, res);
					}else{
						console.log("not used cache");
						//���cache
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
						//���õ�ǰ���һ�ڵ�cache
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
									var kenoDate= tz(new Date().getTime(), "%F ", res[i].time_zone);//�õ���ǰʱ��������
									var openTime = kenotz(kenoDate + res[i].open_time, res[i].time_zone);//�����Ϸ��ʼ��ʱ��
									var sub1 = Math.abs(res[i].next_draw_time - res[i+1].next_draw_time - drawSeconds);
									var sub2 = Math.abs(res[i+1].next_draw_time - res[i+2].next_draw_time - drawSeconds);
									//��3�����Ա� ���ݲΧ�� && ��ʼ4������ && �����ǽ���� �����ϸ�
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

//�õ���Ϸ������һ�ڿ���
Game.getNextAwardTimeByCode = function (typeId, callback) {
	var sql = "SELECT MAX(next_draw_time) AS time FROM bet_award WHERE award_type_id = " + typeId;
	var args = null;
	mysqlClient.query(sql,args,function(err, res){
		callback(err, res[0].time);
	});

}


//�õ�������Ϸ�б�
Game.getGameList = function (callback) {
	var sql = "SELECT * FROM bet_award_type ORDER BY order_id";
	var args = null;
	var _this = this;
	var games = Array();
	mysqlClient.query(sql,args,function(err, res){
		if (!err)
		{
			for(var i in res)
			{
				_this.getGameByCode(res[i].type_id, function(err, data){
					data.lottery_type = res[i].lottery_type;
					games.push(data);
					if (games.length == res.length)
					{
						callback(null, games);
					}
				});

			}
		}else{
			callback(err, null);
		}

	});
}

eval(fs.readFileSync('./library/dateformat.js').toString());