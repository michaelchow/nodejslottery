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

$('#test1').click(function() {
    game.switchBlock('game1', 'game2');
});

$('#reset').click(function() {
    socket.emit('reset');
});