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
	this.typeId = data.type_id;
	this.drawPattern   = data.draw_pattern; //������������
    this.numbersPattern = data.numbers_pattern; //�����������
    this.timePattern = data.time_pattern; //����ʱ������
    this.url = data.url; //url��ַ
    this.code = data.type_id; //�����������id
    this.drawSeconds = data.draw_seconds;
    this.timeZone = data.time_zone; //����ʱ��
    this.drawType = data.draw_type; //�Ƿ���������ǰ���Ͻ��������
	this.lotteryType = data.lottery_type;//��ʱʱ�ʻ��ǿ��ֲ�

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
	 console.log(this.url);
	 http.get(this.url,function(data,status,headers){
		
		/*====================begin ���������� ������� ʱ��=========================*/
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
					drawArray.push(_this.generateDrawByTime(_this.sortTime(timeGroup.join(":"))));
				//_this.generateDrawByTime(_this.sortTime(timeGroup.join(":"));
			}
			
		}
console.log(drawArray);
console.log(numbersArray);
console.log(timeArray);
		/*====================end ���������� ������� ʱ��=========================*/

		var awards = Array();
		for(var i in drawArray)
		{
			console.log("time " + i + " : " + timeArray[i]);
			var time = _this.sortTime(timeArray[i]);
			game.insertAward(i, _this.sortDraw(drawArray[i]), _this.typeId, numbersArray[i], time, time + _this.drawSeconds, function(err, res){
				//console.log(newAwards);
				if(!err)
					awards.push(res);
				if (awards.length == drawArray.length)//�����첽�߳�ִ����ɺ� ��ִ����һ��
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
		return callback(e.message, null);
	});

};

//����ʱ��
Lottery.sortTime = function (timeStr) {
	var Lotterytz = tz(require("timezone/" + this.timeZone));
	var LotteryDate= tz(new Date().getTime(), "%F ", this.timeZone);//�õ���ǰʱ��������
	switch (timeStr.split(":").length)
	{
		case 1 ://ֻ������ �õ�������һ��ʣ������� ����Ҫ��ȥһ��ʱ��
			//console.log(timeStr + "seconds left");
			//console.log(new Date());
			//console.log(new Date(new Date().getTime() + parseInt(timeStr) * 1000));
			return Math.floor(new Date().getTime() / 1000 + parseInt(timeStr) - this.drawSeconds);
			break;
		case 2 :
		case 3 ://ʱ���ʽ��ȫ
			var time = Lotterytz(LotteryDate + timeStr, this.timeZone);//���������Ϸ����ʱ��
			return Math.floor(time / 1000);
		default:
			break;
	
	}
	


}
//��������
Lottery.sortDraw = function (drawStr) {
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
	game.getGameByCode(this.code, function(err, result){
	});
}

//�ڿ���ʱִ��
Lottery.onNextAwardTime = function (callback) {
	game.getNextAwardTimeByCode(this.code, function(err, result){
		if (!err)
		{
			console.log(new Date(result*1000));
			seconds = result - Math.round(new Date().getTime()/1000);
			result = seconds > 0 ? seconds : 0;
			return callback(result);
		}
	});
}

//�ڿ���ʱִ��
Lottery.generateDrawByTime = function (timeStamp) {
	var todayPastSeconds = timeStamp - Math.round(Date.parse(new Date().Format("yyyy-MM-dd 00:00:00")) / 1000);
	return  Math.floor(todayPastSeconds / this.drawSeconds);
}

eval(fs.readFileSync('./library/dateformat.js').toString());