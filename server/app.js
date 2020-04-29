const http = require('http');
const AWS = require('aws-sdk');
const moment = require('moment')

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

app.get('/current_state', async (req, response) => {
    const resp = await dynamoClient.get({
        TableName: 'ct152',
        Key: {
            pk: 'userId#1'
        },
        ConsistentRead: true
    }).promise();
    response.json(resp.Item);
})

app.post('/operation', async function(request, response){
    try {
        const resp = await dynamoClient.update({
            TableName: 'ct152',
            Key: {
                pk: 'userId#1'
            },
            UpdateExpression: `
              set exercises.#exercise.rounds.#round.completed = :completed,
                  exercises.#exercise.rounds.#round.updatedAt = :updatedAt,
                  exercises.#exercise.updatedAt = :updatedAt,
                  updatedAt = :updatedAt
              ADD exercises.#exercise.rounds.#round.#version :inc
            `,
            ConditionExpression: 'exercises.#exercise.rounds.#round.#version < :version',
            ExpressionAttributeNames: {
                '#version': 'version',
                '#round': request.body.round,
                '#exercise': request.body.exercise
            },
            ExpressionAttributeValues: {
                ':inc': 1,
                ':completed': true,
                ':version': request.body.version,
                ':updatedAt': moment().format()
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
        response.json({
            succeeded: true,
            recordToSync: resp
        });
    } catch (err) {
        console.log(err.message);
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




