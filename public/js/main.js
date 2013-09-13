var socket = io.connect(window.location.hostname);
var game = new Game();

socket.on('SYS_SYN_RES', function (res) {
	game.showTime(res.res); 
});

socket.on('SYS_CURR_RESULT', function (res) {
	game.showAward(res);
});

socket.on('SYS_CURR_GAME_RES', function (res) {
	game.setGame(res);
});

socket.on('SYS_AWARD_RES', function (res) {
	game.setAwards(res);
});

$('#test1').click(function() {
    game.switchBlock('game1', 'game2');
});

$('#reset').click(function() {
    socket.emit('reset');
});


$(".menu li").hover(function() {
	_this = $(this);
	_this.parents(".wrap").find(".history div").each(function(index){
		//寻找索引 控制显示隐藏
		if (index == _this.parent().find("li").index(_this))
			$(this).show();
		else
			$(this).hide();
	});
	$(this).siblings().removeClass("on");
	$(this).addClass("on");
});