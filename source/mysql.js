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
const mysql = require('mysql2/promise')

class MysqlClient {
  constructor() {
    this.data = DATABASE
  }

  async connect() {
    const connection = await mysql.createConnection({
      host: this.data.host,
      port: this.data.port,
      user: this.data.user,
      //password: this.data.pass,
      debug: false,
      database: this.data.name
    })
    const [rows, fields]= await connection.execute('select * from tbl_int_cred');
    return rows
  }

  disconnet() {
    connection.end()
  }
}


export default MysqlClient
