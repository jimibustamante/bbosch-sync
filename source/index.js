import ZohoApi from './zoho.js'
import MysqlClient from './mysql.js'

const api = new ZohoApi()
const mysqlClient = new MysqlClient()
async function run() {
  // let contacts = await api.getContacts()
  // console.log(contacts);
  let bbosch = await mysqlClient.connect()
  console.log(bbosch);
  return bbosch
}
let bbosch = mysqlClient.connect()

// run()
