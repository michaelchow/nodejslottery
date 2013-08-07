function Keno() {
}

Keno.prototype.showAward = function(data) {
	$("#game1 .num_left li").animate({ opacity: 0 }, 0);
	$("#game1 .num_left li").each(function(i) {
		setTimeout(function(){
			$("#game1 .num_left li").eq(i).animate({
				opacity: 1,
				rotateX:360
			},
			{
				step: function(now, fx) {
					if (fx.prop == 'rotateX')
						$(this).css({transform: 'rotateX(' + now + 'deg)'});
				}
			});
		},500 * i);
	});

}