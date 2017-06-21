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

      // STCD1: ' ',
      // KUNNR: '0000000100',
      // LIMCR: 900000000,
      // LIMPR: 780836815,
      // CRTOT: 25354790,
      // CRCOM: 806191605,
      // CRAGO: 89.58,
      // WAERS: 'CLP'
    }
    if (origin === 'crm' || !origin) {
      this.codSap = params['CoD SAP']
      this.rut = params['RUT Cliente']
      this.creditoProduccion = params['Crédito en Producción']
      this.limiteCredito = params['Limite de Crédito']
      this.creditoDeFacturas = params['Crédito de facturas pp']
      this.creditoTotal = params['Comprometido total']
      this.agotamiento = params['Grado de agotamiento']
      
      // { ACCOUNTID: '2449077000000397077',
      //   SMOWNERID: '2449077000000125001',
      //   'Account Owner': 'Santiagosystems BBosch',
      //   'Account Name': 'CARPE DIEM INDUSTRIAL SPA',
      //   'Account Type': 'Cliente',
      //   SMCREATORID: '2449077000000125001',
      //   'Created By': 'Santiagosystems BBosch',
      //   MODIFIEDBY: '2449077000000114009',
      //   'Modified By': 'fcantillana',
      //   'Created Time': '2017-06-08 20:20:37',
      //   'Modified Time': '2017-06-13 11:59:05',
      //   'Last Activity Time': '2017-06-13 11:59:05',
      //   'RUT Cliente': '76227352-7',
      //   'CoD SAP': '762277',
      //   'Valor Cliente': 'A',
      //   'Índice Fortaleza Marca': '1 Muy Alto',
      //   'Facturación anual': '145168644',
      //   'Facturación acumulada año': '60486935',
      //   'Precio promedio': '290',
      //   'Crédito en Producción': '5672333',
      //   'Lealtad Transaccional': 'false',
      //   Giro: 'FABRICACION',
      //   'Calle facturación': 'CAMINO VECINAL PARCELA 15',
      //   'Ciudad facturación': 'SANTIAGO',
      //   'Comuna facturación': 'MAIPU',
      //   'País facturación': 'Chile',
      //   'Región facturación': '13',
      //   Bloqueo: 'false',
      //   Pedidos: 'false',
      //   Entregas: 'false',
      //   'Todas las sociedades': 'false',
      //   'Todas las áreas de venta': 'false',
      //   'Facturación': 'false',
      //   'Condiciones de pago': '45 dias emision de factura' },

    }
  }
}

export default Client
