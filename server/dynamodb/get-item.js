var params = {
    TableName: 'ct152',
    Key: {
        pk: 'userId#1'
    },
    AttributesToGet: [
        'count'
    ],
    ConsistentRead: true
};
docClient.get(params, function(err, data) {
    if (err) ppJson(err); // an error occurred
    else ppJson(data); // successful response
});