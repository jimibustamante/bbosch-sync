const xmlBuilder = require('xmlbuilder')

class Client {
  constructor(params, origin) {
    if (origin === 'sap') {
      this.rut = params.STCD1
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
      this.creditoProduccion = params['Crédito en Producción']
      this.limiteCredito = params['Limite de Crédito']
      this.creditoDeFacturas = params['Crédito de facturas pp']
      this.creditoTotal = params['Comprometido total']
      this.agotamiento = params['Grado de agotamiento']
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
              '#text': this.rut.replace(' ', '')
            },
            {
              '@val': 'CoD SAP',
              '#text': this.codSap
            },
            {
              '@val': 'Crédito en Producción',
              '#text': this.creditoProduccion
            },
            {
              '@val': 'Limite de Crédito',
              '#text': this.limiteCredito
            },
            {
              '@val': 'Crédito de facturas pp',
              '#text': this.creditoDeFacturas
            },
            {
              '@val': 'Comprometido total',
              '#text': this.creditoTotal
            },
            {
              '@val': 'Grado de agotamiento',
              '#text': this.agotamiento
            }
          ]
        }
      }
    });
    return xml.end({ pretty: true }).replace('<?xml version="1.0"?>','')

  }

  buildCrmXml() {
    let xml = xmlBuilder.create({
      'Accounts': {
        'row': {
          '@no': '1',
          'FL': [
            {
              '@val': 'RUT Cliente',
              '#text': this.rut.replace(' ', '')
            },
            {
              '@val': 'CoD SAP',
              '#text': this.codSap
            },
            {
              '@val': 'Crédito en Producción',
              '#text': this.creditoProduccion
            },
            {
              '@val': 'Limite de Crédito',
              '#text': this.limiteCredito
            },
            {
              '@val': 'Crédito de facturas pp',
              '#text': this.creditoDeFacturas
            },
            {
              '@val': 'Comprometido total',
              '#text': this.creditoTotal
            },
            {
              '@val': 'Grado de agotamiento',
              '#text': this.agotamiento
            },
            {
              '@val': 'Account Owner',
              '#text': 'Santiagosystems BBosch'
            },
            {
              '@val': 'Account Name',
              '#text': 'Test from SAP'
            }
          ]
        }
      }
    });
    return xml.end({ pretty: true }).replace('<?xml version="1.0"?>','')
  }

}

export default Client
