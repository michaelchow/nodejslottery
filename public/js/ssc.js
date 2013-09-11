function Ssc() {
	this.gameList = new Array();
}

Ssc.prototype.setGame = function(data) {
	if (data.status)
	{
		this.gameList[data.code] = data;
	}else{
		this.gameList.splice($.inArray(data,this.gameList),1);
	}
}
