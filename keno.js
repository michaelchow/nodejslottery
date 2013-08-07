/**
 * Export the constructor.
 */
var Keno = exports = module.exports = {};

/**
 * Keno constructor.
 *
 * @param {data} json data
 * @api public
 */
Keno.init = function(data){
	this.roundPattern   = data.round_pattern; //������������
    this.numbersPattern = data.numbers_pattern; //�����������
    this.timePattern = data.time_zone; //����ʱ������
    this.url = data.url; //url��ַ
    this.code = data.type_id; //�����������id
    this.roundSeconds = data.round_seconds;
    this.timeZone = data.time_zone; //����ʱ��
    this.roundType = data.round_type; //�Ƿ���������ǰ���Ͻ��������
};

/**
 * get award
 *
 * @api public
 */

Keno.getAward = function () {
	 var http = require('nodegrass');
	 var _this = this;
	 http.get(this.url,function(data,status,headers){
		
		var numbersReg = new RegExp(_this.numbersPattern,"ig");
		var numbersArray = Array();
		while(numbers = numbersReg.exec(data)) {
			var numbersGroup = Array();
		   	for(i=1;i<numbers.length;i++){
				numbersGroup.push(numbers[i]);
			}
			numbersArray.push(numbersGroup.join(","));
		}
		var roundArray = Array();
		var roundReg = new RegExp(_this.roundPattern,"ig");
		while(round = roundReg.exec(data)) {
			var roundGroup = Array();
		   	for(i=1;i<round.length;i++){
				roundGroup.push(round[i]);
			}
			roundArray.push(roundGroup);
		} 

		var timeArray = Array();
		var timeReg = new RegExp(_this.timePattern,"ig");
		while(time = timeReg.exec(data)) {
			var timeGroup = Array();
		   	for(i=1;i<time.length;i++){
				timeGroup.push(time[i]);
			}
			timeArray.push(timeGroup.join(":"));
		}
		
		console.log(numbersArray);
		console.log(roundArray);
		console.log(timeArray);

	},'utf8').on('error', function(e) {
		console.log("Got error: " + e.message);
	});

};

Keno.getAwardTimeout = function () {
	var game = require('./game');
	game.getGameByCode(this.code);
}
