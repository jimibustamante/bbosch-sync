require('dotenv/config')
const DATABASE = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
}
const request = require('request-promise')
const _ = require('underscore-node')
const mysql = require('mysql')

class MysqlClient {
  constructor() {
    this.data = DATABASE
  }

  connect() {
    let connection = mysql.createConnection({
      host: this.data.host,
      port: this.data.port,
      user: this.data.user,
      password: this.data.pass,
      debug: true,
      database: this.data.name
    })
    // DB_HOST = 200.27.145.76
    // DB_PORT = 3306
    // DB_DATABASE = bbosch_zoho
    // DB_USER =  zoho
    // DB_PASS = Bbosch123..
    console.log(this.data);
    connection.connect();

    connection.query('select * from tbl_int_cred', function (error, results, fields) {
      if (error) throw error;
      console.log('The solution is: ', results);
      console.log('The fields is: ', fields);
    });
  }

  disconnet() {
    connection.end()
  }
}


export default MysqlClient
