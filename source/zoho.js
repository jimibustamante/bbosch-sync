require('dotenv/config')
const API_KEY= process.env.ZOHO_API_TOKEN
const request = require('request-promise')
const _ = require('underscore-node')

class ZohoApi {
  constructor() {
    console.log('Constructor! ', API_KEY)
  }

  async getAccounts() {
    console.log("GET CLIENTS!");
    let response = await request.get(`https://crm.zoho.com/crm/private/json/Accounts/getRecords?newFormat=1&authtoken=${API_KEY}&scope=crmapi&fromIndex=1&toIndex=200&selectColumns=All`)
    console.log(response);
    response = this.parseCrmResponse(response)
    return response
  }

  parseCrmResponse(list) {
    list = JSON.parse(list)
    var studentList = [];
    var elements = list['response']['result']['Accounts']['row'];
    _.each(elements, function (item) {
      var student = {};
      _.each(item['FL'], function (attr) {
        student[attr.val] = attr.content;
      })
      studentList.push(student);
    })
    return studentList;
  }
}

export default ZohoApi
