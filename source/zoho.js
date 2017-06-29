require('dotenv/config')
const API_KEY= process.env.ZOHO_API_TOKEN
const request = require('request-promise')
const _ = require('underscore-node')
const URL = require('url')
const xmlBuilder = require('xmlbuilder')

class ZohoApi {
  constructor() {
    console.log('Constructor! ', API_KEY)
  }

  async getAccounts(from, to) {
    from = from || 1
    to = to || 200
    console.log("GET CLIENTS!");
    // console.log(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?version=2&newFormat=2&authtoken=${API_KEY}&scope=crmapi&fromIndex=${from}&toIndex=${to}&selectColumns=All`);
    let response = await request.get(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?newFormat=1&authtoken=${API_KEY}&scope=crmapi&fromIndex=${from}&toIndex=${to}&selectColumns=All`)
    response = this.parseCrmResponse(response)
    return response
  }

  async insertCrmClient(client) {
    let url = encodeURI('https://crm.zoho.com/crm/private/xml/Accounts/insertRecords?authtoken='+ API_KEY + '&scope=crmapi&newFormat=1&xmlData=' + client.buildCrmXml() + '&duplicateCheck=1')
    let response = await request.get(url)
    console.log(response);
    return response
  }

  async updateCrmClient(client) {
    // console.log(client);
    let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/updateRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${client.buildUpdateXml()}&id=${client.id}`)
    if (client.rut === '77880610-k' || client.rut === '4795643-9') {
      console.log('UPDATE')
    }
    // console.log(url)
    let response = await request.get(url)
    //console.log(response)
    return response
  }

  async updateClientList(list) {
    let toUpdateList
    do {
      toUpdateList = _.first(list.filter(c => {return !c.updated}), 10)
      let xml = this.buildUpdateListXml(toUpdateList)
      let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/updateRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${xml}&version=4`)
      // console.log(url);
      toUpdateList.forEach(c => { c.updated = true })
      console.log(toUpdateList.length);
      let response = await request.get(url)
      console.log(response);
    } while (toUpdateList.length === 10);
  }

  buildUpdateListXml(list) {
    let xml = xmlBuilder.create('Accounts')
    let i = 1
    list.forEach(client => {
      let row = xml.ele('row')
      row.att('no', i)
      row.ele('FL', {'val': 'Id'}, client.id)
      row.ele('FL', {'val': 'RUT Cliente'}, client.rut)
      row.ele('FL', {'val': 'Cod SAP'}, client.codSap)
      row.ele('FL', {'val': 'Account Name'}, client.name)
      row.ele('FL', {'val': 'Crédito en Producción'}, client.creditoProduccion || 0)
      row.ele('FL', {'val': 'Limite de Crédito'}, client.limiteCredito || 0)
      row.ele('FL', {'val': 'Crédito en Facturas PP'}, client.creditoDeFacturas || 0)
      row.ele('FL', {'val': 'Comprometido Total'}, client.creditoTotal || 0)
      row.ele('FL', {'val': 'Grado de Agotamiento'}, parseInt(client.agotamiento) || 0)
      i += 1 
    })
    console.log(xml.end({ pretty: true }))
    return xml.end().replace('<?xml version="1.0"?>','')

  }

  parseCrmResponse(list) {
    list = JSON.parse(list)
    var clientList = [];
    var elements = list['response']['result']['Accounts']['row'];
    _.each(elements, function (item) {
      var client = {};
      _.each(item['FL'], function (attr) {
        client[attr.val] = attr.content;
      })
      clientList.push(client);
    })
    return clientList;
  }
}

export default ZohoApi
