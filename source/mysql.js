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
    let connection = await mysql.createConnection({
      host: this.data.host,
      port: this.data.port,
      user: this.data.user,
      //password: this.data.pass,
      debug: false,
      database: this.data.name
    })
    return connection
  }

  async getClients() {
    let connection = await this.connect()
    let [rows, fields] = await connection.execute('select * from tbl_int_credito');
    connection.end()
    return rows
  }

  async getLocks() {
    let connection = await this.connect()
    let [rows, fields] = await connection.execute('select * from tbl_int_bloqueo');
    console.log(rows);
    connection.end()
    return rows
  }

  async getKpis() {
    let connection = await this.connect()
    let [rows, fields] = await connection.execute('select * from tbl_int_kpi');
    console.log(rows);
    connection.end()
    return rows
  }
}

export default MysqlClient
