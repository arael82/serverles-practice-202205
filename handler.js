'use strict';

const crypto = require('crypto');

const AWS = require('aws-sdk')

const QUEUE_URL = process.env.PENDING_ORDER_QUEUE
const REGION = process.env.REGION

AWS.config.update({region:REGION});

var sqs = new AWS.SQS();

module.exports.hacerPedido = (event, context, callback) => {
  console.log('HacerPedido fue llamada');
  const orderId = crypto.randomUUID();

  const params = {
    MessageBody: JSON.stringify({ orderId: orderId }),
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
  console.log(event);
  callback();
};

function sendResponse(statusCode, message, callback) {
  
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  callback(null, response);

}