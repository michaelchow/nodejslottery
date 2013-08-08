var mysqlClient = require('./../library/mysqlclient').init();
/*
 * GET home page.
 */

exports.index = function(req, res){

	var args = null;
	var sql = "SELECT * FROM bet_award_type";
	mysqlClient.query(sql,args,function(err, data){
		res.render('index', { title: data[0].title, game:data });
	});

};