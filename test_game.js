var game = require('./model/game');

game.getGameList(function(err, data){

	console.log(data);

});