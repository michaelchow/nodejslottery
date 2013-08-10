function Game() {
	this.keno = new Keno();
}
//游戏板块变换位置
Game.prototype.switchBlock = function(blockId1, blockId2) {  
	var html = $("#" + blockId1).html();
	$("#" + blockId1 ).html($("#" + blockId2 ).html());
	$("#" + blockId2 ).html(html);
}

//动态显示时间
Game.prototype.showTime = function(data) {
	
    var D = new Date(data);
    var dateStr = "";
    var dateStr = dateStr + D.getFullYear() + "年";
		dateStr = (D.getMonth() + 1) <= 9 ? dateStr + "0" : dateStr;
        dateStr = dateStr + (D.getMonth() + 1) + "月";
		dateStr = D.getDate() <= 9 ? dateStr + "0" : dateStr;
        dateStr = dateStr + D.getDate() + "日 ";
		dateStr = D.getHours() <= 9 ? dateStr + "0" : dateStr;
        dateStr = dateStr + D.getHours() + ":";
		dateStr = D.getMinutes() <= 9 ? dateStr + "0" : dateStr;
        dateStr = dateStr + D.getMinutes() + ":";
		dateStr = D.getSeconds() <= 9 ? dateStr + "0" : dateStr;
        dateStr = dateStr + D.getSeconds();
	$('#time').html(dateStr);
	data = parseInt(data) + 1000;
    setTimeout("game.showTime(" + data + ")", 1000);
}


//开奖画面
Game.prototype.showAward = function(data) {
	var game = eval("new " + this._ucfirst(data.lottery_type) + "()");//动态new 一个对象 比如Keno 正则是首字母大写
	game.showAward(data.res);
}

//设置游戏时间、期数
Game.prototype.setGame = function(data) {
	eval("this." + data.lottery_type).setGame(data);
}
/*
//私有函数 首字母大写
Game.prototype._ucfirst = function(str) {
	str = str.replace(/(^|\s+)\w/g,function(s){return s.toUpperCase();});
	return str;
}
*/
