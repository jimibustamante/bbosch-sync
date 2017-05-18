import ZohoApi from './zoho.js'

const api = new ZohoApi()
async function run() {
  let contacts = await api.getContacts()
  console.log(contacts);
  return contacts
}

run()
