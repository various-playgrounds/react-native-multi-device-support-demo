const http = require('http');
const AWS = require('aws-sdk');

AWS.config.update({
    endpoint: `http://localhost:8000`,
    region: 'us-east-1'
});
dynamoClient = new AWS.DynamoDB.DocumentClient();

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.raw());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

// Access the parse results as request.body
app.post('/operation', async function(request, response){
    console.log(request.body.id);
    console.log(request.body.version);
    try {
        const resp = await dynamoClient.update({
            TableName: 'ct152',
            Key: {
                pk: 'userId#1'
            },
            UpdateExpression: `
              set exercises.#attr = :finished
              ADD version :inc
            `,
            ConditionExpression: '#version <= :version and attribute_not_exists(exercises.#attr)',
            ExpressionAttributeNames: {
                '#attr' : request.body.id,
                '#version': 'version'
            },
            ExpressionAttributeValues: {
                ':inc': 1,
                ':finished': 'completed',
                ':version': request.body.version
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
        response.json({
            succeeded: true
        });
    } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
            console.log('The progress is not in-synced, return update-to-date record to client first');
            const resp = await dynamoClient.get({
                TableName: 'ct152',
                Key: {
                    pk: 'userId#1'
                },
                ConsistentRead: true
            }).promise();
            response.json({
                succeeded: false,
                recordToSync: resp
            });
        }
    }
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




