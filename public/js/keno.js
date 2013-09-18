function Keno() {
	this.gameList = new Array();
}

Keno.prototype.showAward = function(data) {
	$("#game" + data.typeId + " .num_left li").animate({ opacity: 0 }, 0);
	$("#game" + data.typeId + " .num_left li").css({transform: 'rotateX(0deg)'});
	
	var numArray = data.res[0].numbers.split(',');
	for(var i in data.res[0].numbers.split(',')){
		$("#game" + data.typeId + " .num_left li").eq(i).find("a").text(numArray[i]);
	}
	var totalSum = 0;
	var _this = this;
	$("#game" + data.typeId + " .num_left li").each(function(i) {
		setTimeout(function(){
			$("#game" + data.typeId + " .num_left li").eq(i).animate({
				opacity: 1,
				rotateX:360
			},
			{
				step: function(now, fx) {
					if (fx.prop == 'rotateX')
						$(this).css({transform: 'rotateX(' + now + 'deg)'});
				},
				complete: function(){
					totalSum += parseInt(numArray[i]);//算分数总值
					Game.shake($("#game" + data.typeId + " .bet_x ." + _this._getBigSmall(totalSum)), "border_red", 2);
					//alert(totalSum);
				}
			});
		},500 * i);
	});
}

Keno.prototype.tickTock = function() {
	for (var i in this.gameList)
	{
		if (this.gameList[i].timeout)
			this.gameList[i].timeout--;
		$("#game" + i + " .countdown span").text(this.gameList[i].timeout);
	}
}


Keno.prototype.setGame = function(data) {
	if (data.status)
	{
		this.gameList[data.code] = data;
	}else{
		this.gameList.splice($.inArray(data,this.gameList),1);
	}
}

Keno.prototype.setAwards = function(data) {
	try{
		this.gameList[data.typeId].awards = data.awards;
		var bigsmall = new Array();
		for (var i in data.awards)
		{
			bigsmall[i] = this._getBigSmall(this._getTotal(data.awards[i].numbers));
			bigsmall[i] = lang[bigsmall[i]];
		}
		this.setHistory(6,20,bigsmall,$("#game" + data.typeId + " .h1 table"));
	}catch(e){
		//alert(data);
	}
}

Keno.prototype.setHistory = function(row, col, data, obj){
	var index = 0;
	var res=new Array()
	var breaked = false;
	for(var i=0; i<col; i++){
		for(var j=0; j<row; j++){
			if (index != 0)
			{
				if(data[index] == data[index-1] || breaked == true)
				{
					res[col*j+i] = data[index++];
					breaked = false;
					
				}
				else{
					breaked = true;
					break;
				}
			}
			else{
				res[col*j+i] = data[index++];
			}
		}
	}

	obj.html("");
	var html = "<table>";
	for(var i=0; i<row; i++){
		html += "<tr>";
		for(var j=0; j<col; j++){
			if (typeof(res[col*i+j]) != 'undefined')
			{
				html += "<td>" + res[col*i+j] + "</td>";
			}else{
				html += "<td>" + " " + "</td>";
			}
			
		}
		html += "</tr>";
	}
	html += "</table>";
	obj.html(html);
}
Keno.prototype._getTotal = function(nums) {
	var numArray = nums.split(',');
	var total = 0;
	for (var i in numArray)
	{
		total += parseInt(numArray[i]);
	}
	return total;
}
Keno.prototype._getBigSmall = function(total) {
	if (total > 810 ){
		return 'big';
	}else if (total == 810){
		return '810';
	}else{
		return 'small';
	}
}
