var mysql       = require('mysql')
  , mysqlConfig = require('./config/mysql')
  , app = require('express')();
var env = app.get('env');
if(mysqlConfig[env]) {
  mysqlConfig = mysqlConfig[env];
}
exports.createMysqlPool= module.exports.createMysqlPool = function(){
  return mysql.createPool({
        host: mysqlConfig.host,
		port: mysqlConfig.port,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database
  });
}