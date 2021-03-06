import ZohoApi from './zoho.js'
import MysqlClient from './mysql.js'
import Client from './models/client.js'
import mailer from './mailer.js'
const schedule = require('node-schedule')
const moment = require('node-moment')
const _ = require('underscore-node')
const api = new ZohoApi()
const mysqlClient = new MysqlClient()

async function syncClients() {
  console.log(`START TASK AT: ${moment().format('LT')}`);
  console.log("Start fetching CRM Clients...");
  let crmClients, currentCrmClients = [], from = 1, to = 200
  let timeCounter = 0

  let clock = setInterval(()=> {
    timeCounter += 1
  }, 1000)

  // Geting all clients. Api suports 200 rows per request
  do {
    crmClients = await api.getAccounts(from, to)
    currentCrmClients = _.union(currentCrmClients, setClientList(crmClients, 'crm'))
    from += 200
    to += 200
  } while (crmClients.length === 200);

  console.log("CURRENT CRM CLIENTS: ", crmClients.length)
  console.log('Fetching Clients...');
  let bboschClients = await mysqlClient.getClients()
  console.log('Fetching Locks...');
  let bboschLocks = await mysqlClient.getLocks()
  console.log('Fetching KPIs...');
  let bboschKpis = await mysqlClient.getKpis()
  let sapClients = setClientList(bboschClients, 'sap').filter(c => { return c.rut.match(/\b\d{1,8}\-[K|k|0-9]/) })

  console.log('Locks merge...');
  bboschLocks.forEach(lock => {
    let rut = lock['STCD1']
    let client = sapClients.find(c => { return c.rut === rut })
    if (client) {
      client.setLock(lock)
    } else { 
      sapClients.push(new Client(lock, 'sap'))
    }

  })

  console.log('KPIs merge...');
  bboschKpis.forEach(kpi => {
    let rut = kpi['STCD1']
    let client = sapClients.find(c => { return c.rut === rut })
    if (client) {
      client.setKpi(kpi)
    } else { 
      sapClients.push(new Client(kpi, 'sap'))
    }
  })

  let repeatedClients = sapClients.filter(client => {
    let repeated =  currentCrmClients.find(c => { return c.rut === client.rut })
    if (repeated) { return true }  else { return repeated }
  })
  let newClients = _.difference(sapClients, repeatedClients)
  console.log("\nNEW CLIENTS: ", newClients.length)
  console.log("TOTAL SAP CLIENTS: ", sapClients.length);
  console.log("REPEATED: ", repeatedClients.length)

  repeatedClients.forEach( client => {
    let crmClient = currentCrmClients.filter(c => { return c.rut === client.rut })
    // console.log("CRM CLIENTES FILTERED: ", crmClient.length)
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
  clearInterval(clock)
  console.log(`\nTOTAL TIME: ${Math.trunc(timeCounter / 60)}mins ${timeCounter % 60}sec`)
  console.log(`\nEND TASK AT: ${moment().format('LT')}`);

}

function setClientList (clients, origin) {
  let list = []
  clients.forEach(client => {
    list.push(new Client(client, origin))
  })
  return list
}

 syncClients()
// mailer.sendErrorMessage('Error de test', {'test': true, 'hello': 'Hola!', 'num': 1233})

// Schedule task
let j = schedule.scheduleJob('0 7,10,14,17 * * *', () => {
  syncClients()
});
