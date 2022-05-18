'use strict';

const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const REGION = process.env.REGION

AWS.config.update({region:REGION});


module.exports.saveCompletedOrder = order => {

    console.log('Guardar un pedido fue llamado.');

    const delivery_status = "READY_FOR_DELIVERY";

    const params = {
        TableName: process.env.COMPLETED_ORDERS_TABLE,
        Item: order
    };

    return dynamo.put(params).promise();
}