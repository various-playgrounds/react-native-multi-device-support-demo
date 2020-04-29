var params = {
    TableName: 'ct152',
    Item: {
        pk: 'userId#1',
        exercises: {
            1: {
                rounds: {
                    0: {
                        "version": 0
                    },
                    1: {
                        "version": 0
                    },
                    2: {
                        "version": 0
                    }
                }
            },
            2: {
                rounds: {
                    0: {
                        "version": 0
                    },
                    1: {
                        "version": 0
                    },
                    2: {
                        "version": 0
                    }
                }
            }
        }
    },
    ReturnValues: 'NONE',
    ReturnConsumedCapacity: 'NONE'
}
docClient.put(params, function(err, data) {
    if (err) ppJson(err);
    else ppJson(data);
});