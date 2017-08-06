'use strict';

console.log('Loading function');

const aws = require('aws-sdk');
const simpleParser = require('mailparser').simpleParser;
const request = require('request');
const querystring = require('querystring');

const s3 = new aws.S3();


exports.handler = (event, context, callback) => {
    // Get the object from the event and show its content type
    const sesNotification = event.Records[0].ses;
    const timestamp = sesNotification.mail.timestamp;
    const messageId = sesNotification.mail.messageId;

    s3.getObject({
        Bucket: 'ses-reviews-emails',
        Key: sesNotification.mail.messageId
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callback(err);
        } else {
          simpleParser(data.Body, (err, mail) => {

            const toSave = {
              messageId : messageId,
              arrivalDate: timestamp,
              fromEmail: mail.from.value[0].address,
              fromDisplayName: mail.from.value[0].name,
              subject: mail.subject,
              body: mail.text,
              published: false
            };

            request.post({
                 url: "http://resapp-env.eu-west-1.elasticbeanstalk.com/reviews",
                 headers: {
                    "Content-Type": "application/json"
                 },
                 body: toSave,
                 json:true
            }, function(error, response, body){
               callback(null, null)
            });

          })

        }
    });

};
