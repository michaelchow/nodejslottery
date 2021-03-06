function Game() {
	this.keno = new Keno();
	this.ssc = new Ssc();
}
//游戏板块变换位置
Game.prototype.switchBlock = function(blockId1, blockId2) {  
	var html = $("#" + blockId1).html();
	$("#" + blockId1 ).html($("#" + blockId2 ).html());
	$("#" + blockId2 ).html(html);
}

//动态显示时间
Game.prototype.showTime = function(data) {
	this.keno.tickTock();
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
	eval("this." + data.lotteryType).showAward(data);
}
//设置游戏历史
Game.prototype.setAwards = function(data) {
	eval("this." + data.lotteryType).setAwards(data);
}

//设置游戏时间、期数
Game.prototype.setGame = function(data) {
	try{
		eval("this." + data.lotteryType).setGame(data);
	}catch(e){
		alert(data);
	}
}
//静态方法 闪烁显示
Game.shake = function(ele,cls,times){
	var i = 0, t = false, o = ele.attr("class")+" ", c = "", times = times||2;
	if(t) return;
	t= setInterval(function(){
		i++;
		c = i%2 ? o+cls : o;
		ele.attr("class",c);
		if(i==2*times){
			clearInterval(t);
			ele.removeClass(cls);
		}
	},200);
};



/*
//私有函数 首字母大写
Game.prototype._ucfirst = function(str) {
	str = str.replace(/(^|\s+)\w/g,function(s){return s.toUpperCase();});
	return str;
}
*/
