var params = {
    TableName: 'ct152',
    Item: {
        pk: 'userId#1',
        version: 0,
        count: 0
    },
    ReturnValues: 'NONE',
    ReturnConsumedCapacity: 'NONE'
};
docClient.put(params, function(err, data) {
    if (err) ppJson(err);
    else ppJson(data);
});