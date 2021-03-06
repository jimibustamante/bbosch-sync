require('dotenv').config({path: '/home/ssystems/apps/bbosch-sync/.env'})
import mailer from './mailer.js'
const API_KEY= process.env.ZOHO_API_TOKEN
const request = require('request-promise')
const _ = require('underscore-node')
const URL = require('url')
const xmlBuilder = require('xmlbuilder')
console.log(process.env)
class ZohoApi {
  async getAccounts(from, to) {
    from = from || 1
    to = to || 200
    try {
      console.log(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?newFormat=1&authtoken=${API_KEY}&scope=crmapi&fromIndex=${from}&toIndex=${to}&selectColumns=All`)
      let response = await request.get(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?newFormat=1&authtoken=${API_KEY}&scope=crmapi&fromIndex=${from}&toIndex=${to}&selectColumns=All`)
      response = this.parseCrmResponse(response)
      return response
    } catch (error) {
      console.log(error);
      mailer.sendErrorMessage('Error: getAccounts ', error)
    }
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
    //let log = false
    list.forEach(client => {
      let row = xml.ele('row')
      row.att('no', i)
      row.ele('FL', {'val': 'Id'}, client.id)
      row.ele('FL', {'val': 'RUT Cliente'}, client.rut)
      row.ele('FL', {'val': 'CoD SAP'}, client.codSap)
      row.ele('FL', {'val': 'Account Name'}, client.name.replace('&','%26'))
      row.ele('FL', {'val': 'Crédito en Producción'}, client.creditoProduccion || '')
      row.ele('FL', {'val': 'Limite de Crédito'}, client.limiteCredito || '')
      row.ele('FL', {'val': 'Crédito en Facturas PP'}, client.creditoDeFacturas || '')
      row.ele('FL', {'val': 'Comprometido Total'}, client.creditoTotal || 0)
      row.ele('FL', {'val': 'Grado de Agotamiento'}, parseInt(client.agotamiento) || '')
      row.ele('FL', {'val': 'Todas las sociedades'}, client.sociedades && client.sociedades === 'X')
      row.ele('FL', {'val': 'Pedidos'}, client.pedidos && client.pedidos === 'X')
      row.ele('FL', {'val': 'Entregas'}, client.entregas && client.entregas === 'X')
      row.ele('FL', {'val': 'Facturación'}, client.facturacion && client.facturacion === 'X')
      row.ele('FL', {'val': 'Todas las áreas de venta'}, client.areasVenta && client.areasVenta === 'X')
      row.ele('FL', {'val': 'Condiciones de pago'}, `${client.condicionesPago} ${client.texto}`)
      row.ele('FL', {'val': 'Facturación anual'}, parseInt(client.facturacionAnual) || '')
      row.ele('FL', {'val': 'Facturación acumulada año'}, parseInt(client.facturacionAcum) || '')
      row.ele('FL', {'val': 'Kgr acumulados / año'}, parseInt(client.kgrAcum) || '')
      row.ele('FL', {'val': 'Precio promedio'}, parseInt(client.precioMedio) || '')
      row.ele('FL', {'val': 'Bloqueo'}, client.bloqueo)
      i += 1
    })
    // if (log) {console.log(xml.end({pretty: true}))}
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
