const xmlBuilder = require('xmlbuilder')

class Client {
  constructor(params, origin) {
    if (origin === 'sap') {
      this.rut = params.STCD1.replace(' ','')
      this.codSap = params.KUNNR
      this.creditoProduccion = params.LIMPR
      this.limiteCredito = params.LIMCR
      this.creditoDeFacturas = params.CRTOT
      this.creditoTotal = params.CRCOM
      this.agotamiento = params.CRAGO
    }
    if (origin === 'crm' || !origin) {
      this.id = params['ACCOUNTID']
      this.codSap = params['CoD SAP']
      this.rut = params['RUT Cliente']
      this.name = params['Account Name']
      this.creditoProduccion = params['Crédito en Producción']
      this.limiteCredito = params['Limite de Crédito']
      this.creditoDeFacturas = params['Crédito de facturas pp']
      this.creditoTotal = params['Comprometido total']
      this.agotamiento = params['Grado de agotamiento']
      this.ownerId = params['SMOWNERID']
    }
  }

  buildUpdateXml() {
    let xml = xmlBuilder.create({
      'Accounts': {
        'row': {
          '@no': '1',
          'FL': [
            {
              '@val': 'RUT Cliente',
              '#text': this.rut
            },
            {
              '@val': 'CoD SAP',
              '#text': this.codSap
            },
            {
              '@val': 'Account Name',
              '#text': this.name
            },
            {
              '@val': 'Crédito en Producción',
              '#text': this.creditoProduccion || 0
            },
            {
              '@val': 'Limite de Crédito',
              '#text': parseInt(this.limiteCredito) || 0
            },
            {
              '@val': 'Crédito en Facturas PP',
              '#text': parseInt(this.creditoDeFacturas) || 0
            },
            {
              '@val': 'Comprometido Total',
              '#text': parseInt(this.creditoTotal) || 0
            },
            {
              '@val': 'Grado de Agotamiento',
              '#text': parseInt(this.agotamiento) || 0
            },
          ]
        }
      }
    });
    return xml.end().replace('<?xml version="1.0"?>','')
  }
  
  buildCrmXml() {
    let xml = xmlBuilder.create({
      'Accounts': {
        'row': {
          '@no': '1',
          'FL': [
            {
              '@val': 'RUT Cliente',
              '#text': this.rut
            },
            {
              '@val': 'CoD SAP',
              '#text': this.codSap
            },
            {
              '@val': 'Crédito en Producción',
              '#text': parseInt(this.creditoProduccion)
            },
            {
              '@val': 'Limite de Crédito',
              '#text': parseInt(this.limiteCredito)
            },
            {
              '@val': 'Crédito de Facturas PP',
              '#text': parseInt(this.creditoDeFacturas)
            },
            {
              '@val': 'Comprometido Total',
              '#text': parseInt(this.creditoTotal)
            },
            {
              '@val': 'Grado de Agotamiento',
              '#text': parseInt(this.agotamiento)
            },
            {
              '@val': 'Account Owner',
              '#text': 'Santiagosystems BBosch'
            },
            {
              '@val': 'Account Name',
              '#text': `From Sap ${this.rut}`
            }
          ]
        }
      }
    });
    return xml.end({ pretty: true }).replace('<?xml version="1.0"?>','')
  }

}

export default Client
