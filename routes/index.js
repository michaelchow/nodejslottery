var mysqlClient = require('./../library/mysqlclient').init();
/*
 * GET home page.
 */

exports.index = function(req, res){

	//����֧����ַ�Ⱦ�̬��Ϣ
	var args = null;
	var sql = "SELECT * FROM bet_award_type ORDER BY order_id";
	mysqlClient.query(sql,args,function(err, data){
		res.render('index', { title: data[0].title, game:data });
	});

};