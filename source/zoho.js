require('dotenv/config')
const API_KEY= process.env.ZOHO_API_TOKEN
const request = require('request-promise')
const _ = require('underscore-node')

class ZohoApi {
  constructor() {
    console.log('Constructor! ', API_KEY)
  }

  async getAccounts(from, to) {
    from = from || 1
    to = to || 200
    console.log("GET CLIENTS!");
    let response = await request.get(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?newFormat=1&authtoken=${API_KEY}&scope=crmapi&fromIndex=${from}&toIndex=${to}&selectColumns=All`)
    // console.log(response);
    response = this.parseCrmResponse(response)
    return response
  }

  async insertCrmClient(client) {
    console.log(client.buildCrmInsertClient())
    var url = 'https://crm.zoho.com/crm/private/xml/Accounts/insertRecords?authtoken='+ API_KEY + '&scope=crmapi&newFormat=1&xmlData=' + client.buildCrmInsertClient() + '&duplicateCheck=1';
    let response = await request.get(url)
    console.log(response);
    // request(url, function (error, response, body) {
    //   // if (body.includes('Record(s) already exists')) {
    //   //   console.log("RECORD ALREADY EXISTS!");
    //   // }
    // })
  }

  async updateCrmClient(umasStudent, crmStudent, id) {
    var url = 'https://crm.zoho.com/crm/private/xml/Accounts/updateRecords?authtoken='+ API_KEY + '&scope=crmapi&newFormat=1&xmlData=' + buildCrmUpdateStudent(umasStudent, crmStudent) + '&id=' + id;
    request(url, function (error, response, body) {
      // console.log(body);
    })
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
