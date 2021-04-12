const client = require('redis').createClient();

client.on('error', function (err) {
    console.error('Connection error with redis : ' + err.message);
});

client.on('connect', function() {
    console.log('Connected to the redis database.');
})

module.exports = { client }