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


  // async function main() {
  //   // get the client
  //   const  mysql = require('mysql2/promise');
  //   // create the connection
  //   const connection = await mysql.createConnection({host:'localhost', user: 'root', database: 'test'});
  //   // query database
  //   const [rows, fields] = await connection.execute('SELECT * FROM `table` WHERE `name` = ? AND `age` > ?', ['Morty', 14]);
  // }


  async connect() {
    const connection = await mysql.createConnection({
      host: this.data.host,
      port: this.data.port,
      user: this.data.user,
      //password: this.data.pass,
      debug: false,
      database: this.data.name
    })
    console.log(connection);
    // console.log(this.data);
    const [rows, fields]= await connection.execute('select * from tbl_int_cred');
    return rows
    // let clients = await connection.query('select * from tbl_int_cred', function (error, results, fields) {
    //   if (error) throw error;
    //   // console.log('The solution is: ', results);
    //   // console.log('The fields is: ', fields);
    //   return results
    // });
    // return clients
  }

  disconnet() {
    connection.end()
  }
}


export default MysqlClient
