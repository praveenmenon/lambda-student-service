'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit =  (event, context, callback) => {

  const requestBody = JSON.parse(event.body);
  requestBody.SurveyId = uuid.v1();

  const surveyInfo = {
    TableName: "survey-dev",
    Item: requestBody,
  };

  return dynamoDb.put(surveyInfo, function(err, data){
    if(err) console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
    else {
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
        {
          message: 'Form submitted successfully!',
          response: data.Item,
        },null,2),
      };
      callback(null, response);
    }
  });
};

module.exports.list = (event, context, callback) => {
  var params = {
    TableName: "survey-dev",
  };

  console.log("Scanning Candidate table.");
  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("Scan succeeded.");
      return callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          surveys: data.Items
        })
      });
    }

  };

  dynamoDb.scan(params, onScan);
};
