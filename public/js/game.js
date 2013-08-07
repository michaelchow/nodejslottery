function Game() {
}
//游戏板块变换位置
Game.prototype.switchBlock = function(blockId1, blockId2) {  
	var html = $("#" + blockId1).html();
	$("#" + blockId1 ).html($("#" + blockId2 ).html());
	$("#" + blockId2 ).html(html);
}

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

Game.prototype.showAward = function(data) {
	var game = eval("new " + data.lottery_type.replace(/(^|\s+)\w/g,function(s){return s.toUpperCase();}) + "()");//动态new 一个对象 比如Keno 正则是首字母大写
	game.showAward(data.res);
}

Game.prototype.setGame = function(data) {
	//alert(data);
}