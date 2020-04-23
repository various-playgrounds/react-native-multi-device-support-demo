var params = {
    TableName: 'ct152',
    Key: {
        pk: 'userId#1'
    },
    ConsistentRead: true
};
docClient.get(params, function(err, data) {
    if (err) ppJson(err);
    else ppJson(data);
});