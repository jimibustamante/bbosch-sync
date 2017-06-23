import ZohoApi from './zoho.js'
import MysqlClient from './mysql.js'
import Client from './models/client.js'
const _ = require('underscore-node')

const api = new ZohoApi()
const mysqlClient = new MysqlClient()
async function run() {
  console.log("RUN!");
  let crmClients, currentCrmClient = [], from = 1, to = 200
  // Geting all clients. Api suports 200 rows per request
  do {
    crmClients = await api.getAccounts(from, to)
    console.log(crmClients);
    currentCrmClient = _.union(currentCrmClient, setClientList(crmClients, 'crm'))
    console.log("crmClients: ", crmClients.length);
    console.log("currentCrmClient: ", currentCrmClient.length);
    from += 200
    to += 200
  } while (crmClients.length === 200);
  console.log(currentCrmClient.length)

  let bbosch = await mysqlClient.connect()
  console.log("************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************");
  // console.log(bbosch);
  let sapClients = setClientList(bbosch, 'sap').filter(c => { return c.rut.length > 2 })
  let repeatedClients = sapClients.filter(client => {
    let repeated =  crmClients.find(c => { return c.rut === client.rut || c.codSap === client.codSap})
    if (repeated) { return true}  else { return repeated }
  })

  let validRutFiltered = sapClients.filter(client => {
    return client.rut.match(/\b\d{1,8}\-[K|k|0-9]/)
  })
  console.log(validRutFiltered.length)
  console.log(sapClients.length);
  // console.log(sapClients.map(c => { return c.rut }))
  // console.log(sapClients);
  console.log("TEST CLIENT: ", validRutFiltered[0]);
  await api.insertCrmClient(validRutFiltered[0])
}


function setClientList (clients, origin) {
  let list = []
  clients.forEach(client => {
    list.push(new Client(client, origin))
  })
  return list
}

run()
