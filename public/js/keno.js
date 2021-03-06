function Keno() {
	this.gameList = new Array();
}
//开奖画面
Keno.prototype.showAward = function(data) {
	//调试代码
	game.keno.gameList['test' + data.typeId] = data;

	//调试代码


	$("#game" + data.typeId + " .num_left li").animate({ opacity: 0 , rotateX: 0 }, 0);//翻牌角度归零
	
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
					if (fx.prop == 'rotateX'){
							$(this).css({transform: 'rotateX(' + now + 'deg)'});
							//console.log(now);
						}
				},
				complete: function(){
					totalSum += parseInt(numArray[i]);//算分数总值
					
					//以下显示开奖属性
					$("#game" + data.typeId + " .num_right .total").text(totalSum);
					$("#game" + data.typeId + " .num_right .bigSmall").text(lang[_this._getBigSmall(totalSum)]);
					$("#game" + data.typeId + " .num_right .singleDual").text(lang[_this._getSingleDual(totalSum)]);
					$("#game" + data.typeId + " .num_right .oddSumEven").text(lang[_this._getOddSumEven(numArray.slice(0, i).join(','))]);
					$("#game" + data.typeId + " .num_right .fiveElement").text(lang[_this._getFiveElement(totalSum)]);
					
					if (i == $("#game" + data.typeId + " .num_left li").length - 1){
					    socket.emit('USER_TO_RESULT', data.typeId);//拿到最新开奖列表
						$("#game" + data.typeId + " .award_middle .bigSmall").text(lang[_this._getBigSmall(totalSum)]);
						$("#game" + data.typeId + " .award_middle .singleDual").text(lang[_this._getSingleDual(totalSum)]);
						$("#game" + data.typeId + " .award_middle .UpMiddleDown").text(lang[_this._getUpMiddleDown(numArray.join(','))]);
						$("#game" + data.typeId + " .award_middle .oddSumEven").text(lang[_this._getOddSumEven(numArray.join(','))]);
						$("#game" + data.typeId + " .award_middle .fiveElement").text(lang[_this._getFiveElement(totalSum)]);
						$("#game" + data.typeId + " .award_middle .total").text(totalSum);
						$("#game" + data.typeId + " .award_top .draw").text(data.res[0].draw);
					}
					//Game.shake($("#game" + data.typeId + " .bet_x ." + _this._getBigSmall(totalSum)).parent(), "border_red", 1);
					//Game.shake($("#game" + data.typeId + " .bet_x ." + _this._getSingleDual(totalSum)).parent(), "border_red", 1);
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
		if (data.awards.length > 0 )
		{
			this.gameList[data.typeId].awards = data.awards;


			
			var numArray = data.awards[0].numbers.split(',');
			var totalSum = 0;
			for (var i in numArray)
			{
				totalSum += parseInt(numArray[i]);
			}
			
			$("#game" + data.typeId + " .award_middle .bigSmall").text(lang[this._getBigSmall(totalSum)]);
			$("#game" + data.typeId + " .award_middle .singleDual").text(lang[this._getSingleDual(totalSum)]);
			$("#game" + data.typeId + " .award_middle .UpMiddleDown").text(lang[this._getUpMiddleDown(numArray.join(','))]);
			$("#game" + data.typeId + " .award_middle .oddSumEven").text(lang[this._getOddSumEven(numArray.join(','))]);
			$("#game" + data.typeId + " .award_middle .fiveElement").text(lang[this._getFiveElement(totalSum)]);
			$("#game" + data.typeId + " .award_middle .total").text(totalSum);
			$("#game" + data.typeId + " .award_top .draw").text(data.awards[0].draw);
			

			var bigSmall = new Array();
			var singleDual = new Array();
			var oddSumEven = new Array();
			var upMiddleDown = new Array();
			var fiveElementType = new Array();
			var sum = Array();
			var draw = Array();
			
			for (var i in data.awards.reverse())
			{
				bigSmall[i] = this._getBigSmall(this._getTotal(data.awards[i].numbers));
				bigSmall[i] = "<span class=" + bigSmall[i] + ">" + lang[bigSmall[i]] + "</span>";
				
				singleDual[i] = this._getSingleDual(this._getTotal(data.awards[i].numbers));
				singleDual[i] = "<span class=" + singleDual[i] + ">" + lang[singleDual[i]] + "</span>";
				
				oddSumEven[i] = this._getOddSumEven(data.awards[i].numbers);
				oddSumEven[i] = "<span class=" + oddSumEven[i] + ">" + lang[oddSumEven[i]] + "</span>";
				
				upMiddleDown[i] = this._getUpMiddleDown(data.awards[i].numbers);
				upMiddleDown[i] = "<span class=" + upMiddleDown[i] + ">" + lang[upMiddleDown[i]] + "</span>";
				
				fiveElementType[i] = this._getFiveElement(this._getTotal(data.awards[i].numbers));
				fiveElementType[i] = "<span class=" + fiveElementType[i] + ">" +lang[fiveElementType[i]] + "</span>";
				
				sum[i] = this._getTotal(data.awards[i].numbers);
				draw[i] = data.awards[i].draw;
				
				
			}
			this.setHistory(6,20,bigSmall,draw,$("#game" + data.typeId + " .h1 table"), true);
			this.setHistory(6,20,singleDual,draw,$("#game" + data.typeId + " .h2 table"), true);
			this.setHistory(6,20,oddSumEven,draw,$("#game" + data.typeId + " .h3 table"), true);
			this.setHistory(6,20,upMiddleDown,draw,$("#game" + data.typeId + " .h4 table"), true);
			this.setHistory(6,20,sum,draw,$("#game" + data.typeId + " .h5 table"), false);
			this.setHistory(6,20,fiveElementType,draw,$("#game" + data.typeId + " .h6 table"), true);
		}
		
	}catch(e){
		//alert(data);
	}
}
//行数，列数，数据，期数， 对象，是否整理
Keno.prototype.setHistory = function(row, col, data, draw, obj, arrange){
	var index = 0;
	var res=new Array();
	var title=new Array();
	var breaked = false;//截断标示符
	for(var i=0; i<col; i++){
		//列循环
		for(var j=0; j<row; j++){
			//行循环
			if (index != 0)
			{
				if(data[index] == data[index-1] || breaked == true || j == 0 || !arrange)//值相等不截断 已截断就不截断 开头第一个不算截断
				{
					title[col*j+i] = draw[index];
					res[col*j+i] = data[index++];
					breaked = false;//截断标示符
				}
				else{
					breaked = true;
					break;
				}
			}
			else{
				//第一个赋值
				title[col*j+i] = draw[index];
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
				html += "<td title='"+ title[col*i+j] + "期'>" + res[col*i+j] + "</td>";
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