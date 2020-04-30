var params = {
    TableName: 'ct152',
    Item: {
        pk: 'userId#1',
        exercises: {}
    },
    ReturnValues: 'NONE',
    ReturnConsumedCapacity: 'NONE'
}
docClient.put(params, function(err, data) {
    if (err) ppJson(err);
    else ppJson(data);
});

var params = {
    TableName: 'ct152',
    Item: {
        pk: 'userId#1',
        exercises: {},
        versions: {
            exercises: {
                "0": 0,
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 0,
                "9": 0,
                "10": 0,
                "11": 0,
                "12": 0,
                "13": 0,
                "14": 0,
                "15": 0,
                "16": 0,
                "17": 0,
                "18": 0
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