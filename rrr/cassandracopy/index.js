var assert = require('assert');
var cassandra = require('cassandra-driver');
client = new cassandra.Client({ contactPoints: ['192.168.1.161:9042'], localDataCenter: '', keyspace: 'enms_testing' }); 

query = 'SELECT * FROM ins_raw_data';
// client.execute(query)
//   .then(result => console.log('current version is  %s', result.rows[0]));
client.execute(query, [], function(err, result) {
    assert.ifError(err);
    console.log('User with email %s', result.rows[0]);
  });