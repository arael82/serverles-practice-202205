'use strict';

const crypto = require('crypto');

const AWS = require('aws-sdk')

const QUEUE_URL = process.env.PENDING_ORDER_QUEUE
const REGION = process.env.REGION

AWS.config.update({region:REGION});

const orderMetadataManager = require('./orderMetadataManager');

var sqs = new AWS.SQS();

module.exports.hacerPedido = (event, context, callback) => {
  
  console.log('HacerPedido fue llamada');
  console.log(event);

  let body; 
  
  if (event.body !== null && event.body !== undefined) {
    body = JSON.parse(event.body)
  } else {
    const message = {
      message: `Necesita un request body válido.`
    };
    sendResponse(400, message, callback)
  }

  const address = body.address;
  const clientName = body.name;
  const pizzas = body.pizzas;

  const orderId = crypto.randomUUID();

  const params = {
    MessageBody: JSON.stringify({ 
      orderId: orderId,
      clientName: clientName, 
      address: address, 
      pizzas: pizzas }),
    QueueUrl: QUEUE_URL
  };

  sqs.sendMessage(params, function(err, data) {
    if(err) {
      console.err("Ocurrio un error. " + err);
      sendResponse(500, err, callback);
    } else {
      console.log("Mensaje enviado, (" + data.MessageId + "), Orden " + orderId);
      const message = {
        orderId: `${orderId}`
      };
      sendResponse(200, message, callback);
    }
  });
};

module.exports.prepararPedido = (event, context, callback) => {
  
  console.log('PrepararPedido fue llamada');
  console.log(event)
  const order = JSON.parse(event.Records[0].body);

  console.log(`Llegó orden ${order.orderId}`);

  orderMetadataManager.saveCompletedOrder(order).then(data => {
    console.log(`La orden ${order.orderId} se guardó con éxito.`);
    callback();
  }).catch(error => {
    console.error(`La orden ${order.orderId} no se pudo guardar debido a un error.`);
    callback(error);
  });


  callback();
};

function sendResponse(statusCode, message, callback) {
  
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  callback(null, response);

}