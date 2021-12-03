const mysql = require('mysql');
const connectionArch = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '********',
  database : 'archive*******'
});
connectionArch.connect()
module.exports.connectionArch = connectionArch
