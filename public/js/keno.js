function Keno() {
	this.gameList = new Array();
}

Keno.prototype.showAward = function(data) {
	$("#game" + data.typeId + " .num_left li").animate({ opacity: 0 }, 0);
	$("#game" + data.typeId + " .num_left li").css({transform: 'rotateX(0deg)'});
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
				complete: function(){}
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
	this.gameList[data.typeId].awards = data.awards;
	var ok = new Array();
	for (var i in data.awards)
	{
		ok[i] = this._getBigSmall(data.awards[i].numbers);
	}
	this.setHistory(5,20,ok,$("#game1 .h1 table"));
	
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
				html += "<td>" + "</td>";
			}
			
		}
		html += "</tr>";
	}
	html += "</table>";
	obj.html(html);
}

Keno.prototype._getBigSmall = function(nums) {
	var numArray = nums.split(',');
	var total = 0;
	for (var i in numArray)
	{
		total += parseInt(numArray[i]);
	}
	if (total > 810 ){
		return 'big';
	}else if (total == 810){
		return '810';
	}else{
		return 'small';
	}
}
