import ZohoApi from './zoho.js'
import MysqlClient from './mysql.js'
import Client from './models/client.js'

const api = new ZohoApi()
const mysqlClient = new MysqlClient()
async function run() {
  console.log("RUN!");
  let crmClients = await api.getAccounts()
  let currentClients = setClientList(crmClients, 'crm')
  console.log(currentClients)
  // console.log(currentClients.map( c => {
  //   return c['CoD SAP']
  // }));

  
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
  console.log(validRutFiltered)
  // console.log(sapClients.map(c => { return c.rut }))
  // console.log(sapClients);
  console.log(sapClients.length);
  
  // console.log(sapClients);
}


function setClientList (clients, origin) {
  let list = []
  clients.forEach(client => {
    list.push(new Client(client, origin))
  })
  return list
}

run()
