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