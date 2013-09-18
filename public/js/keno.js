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
					Game.shake($("#game" + data.typeId + " .bet_x ." + _this._getBigSmall(totalSum)).parent(), "border_red", 2);
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
		

		var bigSmall = new Array();
		for (var i in data.awards)
		{
			bigSmall[i] = this._getBigSmall(this._getTotal(data.awards[i].numbers));
			bigSmall[i] = lang[bigSmall[i]];
		}
		this.setHistory(6,20,bigSmall,$("#game" + data.typeId + " .h1 table"));
		
		var singleDual = new Array();
		for (var i in data.awards)
		{
			singleDual[i] = this._getSingleDual(this._getTotal(data.awards[i].numbers));
			singleDual[i] = lang[singleDual[i]];
		}
		this.setHistory(6,20,singleDual,$("#game" + data.typeId + " .h2 table"));
		
		var oddSumEven = new Array();
		for (var i in data.awards)
		{
			oddSumEven[i] = this._getOddSumEven(data.awards[i].numbers);
			oddSumEven[i] = lang[oddSumEven[i]];
		}
		this.setHistory(6,20,oddSumEven,$("#game" + data.typeId + " .h3 table"));	
		
		
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

Keno.prototype._getSingleDual = function(total) {
	var singleDualType = '';
	if ((total%2)==0)
	{
		singleDualType =  'dual';
	}
	else
	{
		singleDualType =  'single';
	}
	return singleDualType;
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

Keno.prototype._getFiveElement = function(total) {
	var fiveElementType = '';
	if (total >= 210 &&  total <= 695){
		fiveElementType = "metal";
	}
	else if (total >= 696 && total <= 763)
	{
		fiveElementType = "wood";
	}
	else if (total >= 764 && total <= 855)
	{
		fiveElementType = "water";
	}
	else if (total >= 856 && total <= 923)
	{
		fiveElementType = "fire";
	}
	else if (total >= 924 && total <= 1410)
	{
		fiveElementType = "earth";
	}
	return fiveElementType;
}

Keno.prototype._getOddSumEven = function(nums) {

	var even = 0;
	var odd = 0;
	var oddHeEvenType = '';
	var numArray = nums.split(',');

	for (var i in numArray)
	{
		if(numArray[i] != 0)
		{
			if ((numArray[i]%2)==0 ){
				even++;
			}else{
				odd++;
			}
		}
	}
		
	if (even == 0 && odd == 0 )
	{
		oddHeEvenType =  '';
	}
	else if (even>odd)
	{
		oddHeEvenType =  'even';
	}else if (even<odd)
	{
		oddHeEvenType =  'odd';
	}else if (even == odd)
	{
		oddHeEvenType =  'sum';
	}
	return oddHeEvenType;
}

Keno.prototype._getUpMiddleDown = function(nums) {
	var up = 0;
	var down = 0;
	var upMiddleDownType = '';
	
	var numArray = nums.split(',');
	
	for (var i in numArray)
	{
		if (parseInt(numArray[i]) > 40){
			down++;
		}else if(parseInt(numArray[i]) != 0 ){
			up++;
		}
	}
	if (up== 0 && down == 0)
	{
		upMiddleDownType =  '';
	}
	else if (up>down)
	{
		upMiddleDownType =  'up';
	}
	else if (up<down)
	{
		upMiddleDownType =  'down';
	}
	else if (up == down)
	{
		upMiddleDownType =  'middle';
	}
	return upMiddleDownType;
}