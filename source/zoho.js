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
    do {
      let toUpdateList = _.first(list.filter(c => {return !c.updated}), 100)
      let xml = buildUpdateListXml(toUpdateList)
      let url = encodeURI(`https://crm.zoho.com/crm/private/xml/Accounts/updateRecords?authtoken=${API_KEY}&scope=crmapi&newFormat=1&xmlData=${xml}&version=4`)
      console.log(url);
      toUpdateList.forEach(c => { c.updated = true })
      console.log(toUpdateList.length);
      // let response = await request.get(url)
      // console.log(response);
    } while (toUpdateList.length === 100);
  }

  buildUpdateListXml(list) {
    let xml = xmlBuilder.create('Accounts')
    let i = 1
    list.forEach(client => {
      let item = xmlBuilder.create('row').attr('no', i)
      .ele('FL').attr('id', this.id)
      .ele('FL').attr('RUT Cliente', this.rut)
      .ele('FL').attr('Cod SAP', this.codSap)
      .ele('FL').attr('Account Name', this.name)
      .ele('FL').attr('Crédito en Producción', this.creditoProduccion || 0)
      .ele('FL').attr('Limite de Crédito', this.limiteCredito || 0)
      .ele('FL').attr('Crédito en Facturas PP', this.creditoDeFacturas || 0)
      .ele('FL').attr('Comprometido Total', this.creditoTotal || 0)
      .ele('FL').attr('Grado de Agotamiento', this.agotamiento || 0)
      xml.importDocument(item)
    })
    return xml.end().replace('<?xml version="1.0"?>','')

  //   'Accounts': {
  //     'row': {
  //       '@no': '1',
  //       'FL': [
  //         {
  //           '@val': 'RUT Cliente',
  //           '#text': this.rut
  //         },
  //         {
  //           '@val': 'CoD SAP',
  //           '#text': this.codSap
  //         },
  //         {
  //           '@val': 'Account Name',
  //           '#text': this.name
  //         },
  //         {
  //           '@val': 'Crédito en Producción',
  //           '#text': this.creditoProduccion || 0
  //         },
  //         {
  //           '@val': 'Limite de Crédito',
  //           '#text': parseInt(this.limiteCredito) || 0
  //         },
  //         {
  //           '@val': 'Crédito en Facturas PP',
  //           '#text': parseInt(this.creditoDeFacturas) || 0
  //         },
  //         {
  //           '@val': 'Comprometido Total',
  //           '#text': parseInt(this.creditoTotal) || 0
  //         },
  //         {
  //           '@val': 'Grado de Agotamiento',
  //           '#text': parseInt(this.agotamiento) || 0
  //         },
  //       ]
  //     }
  //   }
  // });
  // return xml.end().replace('<?xml version="1.0"?>','')

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
