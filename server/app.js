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

app.post('/swap_device', async function(request, response) {
    try {
        await dynamoClient.update({
            TableName: 'ct152',
            Key: {
                pk: 'userId#1'
            },
            UpdateExpression: `
              set exercises.#exercise = :completed, deviceId = :deviceId
            `,
            ExpressionAttributeNames: {
                '#exercise': request.body.exercise
            },
            ExpressionAttributeValues: {
                ':completed': 'completed',
                ':deviceId': request.body.deviceId 
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
        response.json({
            succeeded: true
        });
    } catch (e) {
        response.json({
            succeeded: false
        });
    }
});

app.post('/operation', async function(request, response){
    try {
        await dynamoClient.update({
            TableName: 'ct152',
            Key: {
                pk: 'userId#1'
            },
            UpdateExpression: `
              set exercises.#exercise = :completed, deviceId = :deviceId
            `,
            ConditionExpression: 'attribute_not_exists(deviceId) OR deviceId = :deviceId',
            ExpressionAttributeNames: {
                '#exercise': request.body.exercise
            },
            ExpressionAttributeValues: {
                ':completed': 'completed',
                ':deviceId': request.body.deviceId 
            },
            ReturnValues: "NONE"
        }).promise();
        response.json({
            succeeded: true
        });
    } catch (err) {
        if (err.code === 'ConditionalCheckFailedException') {
            console.log('The device is not active, ask to log in first');
            response.json({
                succeeded: false
            });
        }
    }
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




