require('dotenv/config')
const API_KEY= process.env.ZOHO_API_TOKEN
const request = require('request-promise')
const _ = require('underscore-node')
const URL = require('url')
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
    console.log(response)
    return response
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
