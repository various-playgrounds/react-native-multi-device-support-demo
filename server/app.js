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

app.post('/operation', async function(request, response){
    try {
        const resp = await dynamoClient.update({
            TableName: 'ct152',
            Key: {
                pk: 'userId#1'
            },
            UpdateExpression: `
              set exercises.#exerciseNum = :completed
              ADD versions.exercises.#exerciseNum :inc
            `,
            ConditionExpression: 'versions.exercises.#exerciseNum < :version',
            ExpressionAttributeNames: {
                '#exerciseNum': request.body.exercise,
            },
            ExpressionAttributeValues: {
                ':inc': 1,
                ':version': request.body.version,
                ':completed': 'completed' 
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
        response.json({
            succeeded: true,
            recordToSync: resp.Attributes
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
                recordToSync: resp.Item
            });
        }
    }
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




