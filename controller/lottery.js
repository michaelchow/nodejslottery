var  tz = require("timezone")
   , game = require('./../model/game')
   , fs = require('fs');
/**
 * Export the constructor.
 */
var Lottery = exports = module.exports = {};

/**
 * Lottery constructor.
 *
 * @param {data} json data
 * @api public
 */
 

Lottery.init = function(data){
	this.id = data.id;
	this.drawPattern   = data.draw_pattern; //开奖期数正则
    this.numbersPattern = data.numbers_pattern; //开奖结果正则
    this.timePattern = data.time_pattern; //开奖时间正则
    this.url = data.url; //url地址
    this.drawSeconds = data.draw_seconds;//每一局时间
    this.timeZone = data.time_zone; //开奖时区
    this.drawType = data.draw_type; //是否在期数面前加上今天的日期
	this.lotteryType = data.lottery_type;//是时时彩还是快乐彩

};

/**
 * get award
 *
 * @api public
 */

Lottery.getAward = function (callback) {
	 var http = require('nodegrass');
	 var _this = this;
	 //this.url = "http://127.0.0.1"
	 //console.log(_this.numbersPattern);
	 //console.log(this.url);
	 http.get(this.url,function(data,status,headers){
		
		/*====================begin 正则拿期数 开奖结果 时间=========================*/
		var numbersArray = Array();
		
		if (_this.numbersPattern != '')
		{	
			var numbersReg = new RegExp(_this.numbersPattern,"ig");
			while(numbers = numbersReg.exec(data)) {
				var numbersGroup = Array();
				for(i=1;i<numbers.length;i++){
					numbersGroup.push(numbers[i]);
				}
				numbersArray.push(numbersGroup.join(","));
			}
		}

		var drawArray = Array();
		if (_this.drawPattern != '' && this.drawType != 'AutoGenerateByTime')
		{
			var drawReg = new RegExp(_this.drawPattern,"ig");
			while(draw = drawReg.exec(data)) {
				//console.log(draw);
				var drawGroup = Array();
				for(i=1;i<draw.length;i++){
					drawGroup.push(draw[i]);
				}
				drawArray.push(drawGroup);
			}
		}

		var timeArray = Array();
		if (_this.timePattern != '')
		{
			var timeReg = new RegExp(_this.timePattern,"ig");
			while(time = timeReg.exec(data)) {
				var timeGroup = Array();
				for(i=1;i<time.length;i++){
					timeGroup.push(time[i]);
				}
				timeArray.push(timeGroup.join(":"));
				if(_this.drawType == 'AutoGenerateByTime')
					drawArray.push(_this.generateDrawByTime(_this._sortTime(timeGroup.join(":"))));
				//_this.generateDrawByTime(_this._sortTime(timeGroup.join(":"));
			}
			
		}
console.log(drawArray);
console.log(numbersArray);
console.log(timeArray);
		/*====================end 正则拿期数 开奖结果 时间=========================*/

		var awards = Array();
		for(var i in drawArray)
		{
			var time = _this._sortTime(timeArray[i]);
			game.insertAward(i, _this._sortDraw(drawArray[i]), _this.id, numbersArray[i], time, time + _this.drawSeconds, function(err, res){
				//console.log(newAwards);
				if(!err)
					awards.push(res);
				else
					console.log(err);
				if (awards.length == drawArray.length)//多条异步线程执行完成后 再执行下一步
				{
					var newAwards = Array();
					for (var i in awards)
					{
						if (awards[i].award != null)
						{
							newAwards.push(awards[i].award);
						}
					}
					return callback(null, newAwards);
				}
			});
		}
		if (drawArray.length == 0)
		{
			return callback(null, null);
		}
	},'utf8').on('error', function(e) {
		return callback(e.stack, null);
	});

};

//整理时间
Lottery._sortTime = function (timeStr) {
	var lotterytz = tz(require("timezone/" + this.timeZone));
	var lotteryDate= tz(new Date().getTime(), "%F ", this.timeZone);//拿到当前时区的日期
	switch (timeStr.split(":").length)
	{
		case 1 ://只有秒数 拿到的是下一期剩余读秒数 所以要减去一期时间
			//console.log(timeStr + "seconds left");
			//console.log(new Date());
			//console.log(new Date(new Date().getTime() + parseInt(timeStr) * 1000));
			return Math.floor(new Date().getTime() / 1000 + parseInt(timeStr) - this.drawSeconds);
		case 2 :
		case 3 ://时间格式完全
			var time = lotterytz(new Date(Date.parse(lotteryDate + timeStr)).Format("yyyy-MM-dd hh:mm:ss"), this.timeZone);//算出当地游戏开奖时间
			
			
            /* 
             * 现在我们算出开奖时间和现在的时间差
             * 由于网站公布的数据有可能是23;xx到00:xx的结果
             * 严格来讲 应该是没有比现在还要晚一期的时间的，
			 * 但是实际使用中，由于机器时间误差，可能是多晚一些，这里所以时间可以是晚两局时间
			 * 也就是 drawSeconds * 2
             */
			if ((time - new Date().getTime()) > this.drawSeconds * 2 * 1000)
			{
				time = time - 60 * 60 * 24 * 1000;//那么时间就是昨天的，天数减去1
			}

			//处理加拿大西部时间
			if (this.id == 7)
			{
				var delaySecond = 30;//延迟n秒确定开奖 
			}

			return Math.floor(time / 1000);
		default:
			break;
	
	}
	


}
//整理期数
Lottery._sortDraw = function (drawStr) {
	switch (this.drawType)
	{
	case 'AutoGenerateByTime' :
	case 'AddDateBeforeRound' :
		return new Date().Format("yyyyMMdd") + drawStr;
		break;
	default:
		return drawStr;
		break;
	
	}
}

Lottery.getAwardTimeout = function () {
	game.getGameByCode(this.id, function(err, result){
	});
}

//在开奖时执行
Lottery.onNextAwardTime = function (callback) {
	game.getNextAwardTimeByCode(this.id, function(err, result){
		if (!err)
		{
			//console.log(new Date(result*1000));
			seconds = result - Math.round(new Date().getTime()/1000);
			seconds = seconds > 0 ? seconds : 0;
			console.log("we hold on for " + seconds + " seconds.");
			setTimeout(function(){
				return callback();
			}, 1000 * seconds + 1000);
		}
	});
}

//在开奖时执行
Lottery.generateDrawByTime = function (timeStamp) {
	var todayPastSeconds = timeStamp - Math.round(Date.parse(new Date().Format("yyyy-MM-dd 00:00:00")) / 1000);
	return  Math.floor(todayPastSeconds / this.drawSeconds);
}

eval(fs.readFileSync('./library/dateformat.js').toString());