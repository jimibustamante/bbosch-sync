import ZohoApi from './zoho.js'
import MysqlClient from './mysql.js'
import Client from './models/client.js'
const _ = require('underscore-node')

const api = new ZohoApi()
const mysqlClient = new MysqlClient()
async function run() {
  console.log("RUN!");
  let crmClients, currentCrmClients = [], from = 1, to = 200
  // Geting all clients. Api suports 200 rows per request
  do {
    crmClients = await api.getAccounts(from, to)
    currentCrmClients = _.union(currentCrmClients, setClientList(crmClients, 'crm'))
    from += 200
    to += 200
  } while (crmClients.length === 200);
  console.log(_.first(crmClients))
  console.log(_.first(currentCrmClients))
  console.log("CURRENT CRM CLIENTS: ", currentCrmClients.length)

  let bbosch = await mysqlClient.connect()
  let sapClients = setClientList(bbosch, 'sap').filter(c => { return c.rut.length > 2 })
  let repeatedClients = sapClients.filter(client => {
    if (client.rut.replace(' ', '')  === '4795643-9'){console.log(client.rut)}
    let repeated =  currentCrmClients.find(c => { return c.rut === client.rut.replace(' ', '') || c.codSap === client.codSap})
    if (repeated) { return true}  else { return repeated }
  })

  let validRutFiltered = sapClients.filter(client => {
    return client.rut.match(/\b\d{1,8}\-[K|k|0-9]/)
  })
  console.log("VALIDATED RUT: ", validRutFiltered.length)
  console.log("TOTAL SAP CLIENTS:", sapClients.length);
  console.log("REPEATED: ", repeatedClients.length)
  // console.log("TEST CLIENT: ", validRutFiltered[0]);
  // await api.insertCrmClient(validRutFiltered[0])
}


function setClientList (clients, origin) {
  let list = []
  clients.forEach(client => {
    list.push(new Client(client, origin))
  })
  return list
}

run()
