const http = require('http');
const AWS = require('aws-sdk');

AWS.config.update({
    endpoint: `http://localhost:8000`
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
app.post('/operation', function(request, response){
    console.log(request.body.operation);
    console.log(request.body.delta);
    console.log(request.body.version);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))




