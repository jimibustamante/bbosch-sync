require('dotenv/config')
import mailer from './mailer.js'
const API_KEY= process.env.ZOHO_API_TOKEN
const request = require('request-promise')
const _ = require('underscore-node')
const URL = require('url')
const xmlBuilder = require('xmlbuilder')

class ZohoApi {
  async getAccounts(from, to) {
    from = from || 1
    to = to || 200
    let response = await request.get(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?newFormat=1&authtoken=${API_KEY}&scope=crmapi&fromIndex=${from}&toIndex=${to}&selectColumns=All`)
    response = this.parseCrmResponse(response)
    // console.log(response)
    return response
  }

  async insertCrmClient(client) {
    let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/insertRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${client.buildCrmXml()}&duplicateCheck=1`)
    let response = await request.get(url)
    return response
  }

  async insertClientList(list) {
    let toInsertList
    do {
      toInsertList = _.first(list.filter(c => {return !c.updated}), 10)
      let xml = this.buildInsertListXml(toInsertList)
      let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/insertRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${xml}&version=4&duplicateCheck=1`)
      toInsertList.forEach(c => { c.updated = true })
      let response = await request.get(url)
    } while (toInsertList.length === 10);
  }

  async updateCrmClient(client) {
    let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/updateRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${client.buildUpdateXml()}&id=${client.id}`)
    let response = await request.get(url)
    return response
  }

  async updateClientList(list) {
    let toUpdateList
    do {
      toUpdateList = _.first(list.filter(c => {return !c.updated && !c.name.includes('&')}), 4)
      let xml = this.buildUpdateListXml(toUpdateList)
      let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/updateRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${xml}&version=4`)
      toUpdateList.forEach(c => { c.updated = true })
      let response = await request.get(url)
      if (response.includes("<error>")) {
        console.log(response);
        console.log(toUpdateList)
      }
      // console.log(response)
    } while (toUpdateList.length === 4);
  }

  buildInsertListXml(list) {
    let xml = xmlBuilder.create('Accounts')
    let i = 1
    list.forEach(client => {
      let row = xml.ele('row')
      row.att('no', i)
      row.ele('FL', {'val': 'RUT Cliente'}, client.rut)
      row.ele('FL', {'val': 'Cod SAP'}, client.codSap)
      row.ele('FL', {'val': 'Account Name'}, `From Sap ${client.rut}`)
      row.ele('FL', {'val': 'Account Owner'}, 'Santiagosystems BBosch')
      row.ele('FL', {'val': 'Crédito en Producción'}, client.creditoProduccion || 0)
      row.ele('FL', {'val': 'Limite de Crédito'}, client.limiteCredito || 0)
      row.ele('FL', {'val': 'Crédito en Facturas PP'}, client.creditoDeFacturas || 0)
      row.ele('FL', {'val': 'Comprometido Total'}, client.creditoTotal || 0)
      row.ele('FL', {'val': 'Grado de Agotamiento'}, parseInt(client.agotamiento) || 0)
      i += 1
    })
    return xml.end().replace('<?xml version="1.0"?>','')
  }

  buildUpdateListXml(list) {
    let xml = xmlBuilder.create('Accounts')
    let i = 1
    list.forEach(client => {
      let row = xml.ele('row')
      row.att('no', i)
      row.ele('FL', {'val': 'Id'}, client.id)
      row.ele('FL', {'val': 'RUT Cliente'}, client.rut)
      row.ele('FL', {'val': 'CoD SAP'}, client.codSap)
      row.ele('FL', {'val': 'Account Name'}, client.name.replace('&','%26'))
      row.ele('FL', {'val': 'Crédito en Producción'}, client.creditoProduccion || 0)
      row.ele('FL', {'val': 'Limite de Crédito'}, client.limiteCredito || 0)
      row.ele('FL', {'val': 'Crédito en Facturas PP'}, client.creditoDeFacturas || 0)
      row.ele('FL', {'val': 'Comprometido Total'}, client.creditoTotal || 0)
      row.ele('FL', {'val': 'Grado de Agotamiento'}, parseInt(client.agotamiento) || 0)
      row.ele('FL', {'val': 'Todas las sociedades'}, client.sociedades || 0)
      row.ele('FL', {'val': 'Pedidos'}, client.pedidos || 0)
      row.ele('FL', {'val': 'Entregas'}, client.entregas || 0)
      row.ele('FL', {'val': 'Facturación'}, client.facturacion || 0)
      row.ele('FL', {'val': 'Condiciones de pago'}, `${client.condicionesPago} ${client.texto}`)
      row.ele('FL', {'val': 'Facturación anual'}, parseInt(client.facturacionAnual) || 0)
      row.ele('FL', {'val': 'Facturación acumulada año'}, parseInt(client.facturacionAcum) || 0)
      row.ele('FL', {'val': 'Kgr acumulados / año'}, parseInt(client.kgrAcum) || 0)
      row.ele('FL', {'val': 'Precio promedio'}, parseInt(client.precioMedio) || 0)
      row.ele('FL', {'val': 'Bloqueo'}, client.bloqueo || false)
      i += 1
    })
    // console.log(xml.end({pretty: true}))
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
