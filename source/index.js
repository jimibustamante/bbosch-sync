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
  // console.log(crmClients.map(c => {return c['Account Name']}))

  // console.log(_.first(currentCrmClients))
  console.log("CURRENT CRM CLIENTS: ", currentCrmClients.length)

  let bbosch = await mysqlClient.connect()
  let sapClients = setClientList(bbosch, 'sap').filter(c => { return c.rut.match(/\b\d{1,8}\-[K|k|0-9]/) })
  let repeatedClients = sapClients.filter(client => {
    if (client.rut === "96542940-9") {
      console.log("USUARIO ENCONTRADO!")
      console.log(client) 
    }  
    let repeated =  currentCrmClients.find(c => { return c.rut === client.rut })
    if (repeated) { return true }  else { return repeated }
  })
  let newClients = _.difference(sapClients, repeatedClients)
  console.log("NEW CLIENTS: ", newClients.length)
  console.log("TOTAL SAP CLIENTS: ", sapClients.length);
  console.log("REPEATED: ", repeatedClients.length)


  //console.log("\nSTARTING TO INSERT NEW CLIENTS")
  //await api.insertClientList(newClients)

  repeatedClients.forEach( client => {
    let crmClient = currentCrmClients.filter(c => { return c.rut === client.rut })
    console.log("CRM CLIENTES FILTERED: ", crmClient.length)
    crmClient.forEach(async zohoClient => {
    if (zohoClient) {
      client.id = zohoClient.id
      client.ownerId = zohoClient.ownerId
      client.name = zohoClient.name
     }
    })
  })


  console.log("\nSTARTING TO UPDATE EXISTING CLIENTS")
  await api.updateClientList(repeatedClients)
  console.log("\nUPDATE ENDED")

}

function setClientList (clients, origin) {
  let list = []
  clients.forEach(client => {
    list.push(new Client(client, origin))
  })
  return list
}

run()
