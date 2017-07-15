'use strict'
const MAIL_USER = process.env.MAIL_USER
const MAIL_PASS = process.env.MAIL_PASS
const nodemailer = require('nodemailer')
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    }
})

// setup email data with unicode symbols
function errorOptions (message, object) {
  return {
    from: '"Jimi 👻" <jbustamante@santiagosystems.com>', // sender address
    to: 'jimibustamante@gmail.com', // list of receivers
    subject: 'Bbosch - Error ✔', // Subject line
    // text: 'Hello world ?', // plain text body
    html: errorTemplate(message, object) // html body
  }

}

// send mail with defined transport object
function sendErrorMessage (message, object) {
  transporter.sendMail(errorOptions(message, object), (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message %s sent: %s', info.messageId, info.response)
  })
}

function errorTemplate (message, object) {
  return `<h3>Se ha registado un error durante la sincronización</h3>
    <ul>
      <li> Mensaje de error: ${message}</li>
      <li> Referencia: ${JSON.stringify(object)}</li>
    </ul>`
}

export default {
  sendErrorMessage
}
